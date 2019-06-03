"use strict";
var canvas, ctx;
var agentView = false;

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 1;
  var agents = w.agents;

  // draw walls in environment
  ctx.strokeStyle = "rgb(0,0,0)";
  ctx.beginPath();
  for(var i=0,n=w.walls.length;i<n;i++) {
    var q = w.walls[i];
    ctx.moveTo(q.p1.x, q.p1.y);
    ctx.lineTo(q.p2.x, q.p2.y);
  }
  ctx.stroke();

  // draw agents
  // color agent based on reward it is experiencing at the moment
  var r = 0;
  ctx.fillStyle = "rgb(" + r + ", 150, 150)";
  ctx.strokeStyle = "rgb(0,0,0)";
  for(var i=0,n=agents.length;i<n;i++) {
    var a = agents[i];

    // draw agents body
    ctx.beginPath();
    ctx.arc(a.op.x, a.op.y, a.rad, 0, Math.PI*2, true);
    ctx.fill();
    ctx.stroke();

    // draw agents sight
    for(var ei=0,ne=a.eyes.length;ei<ne;ei++) {
      var e = a.eyes[ei];
      var sr = e.sensed_proximity;
      if(e.sensed_type === -1 || e.sensed_type === 0) {
        ctx.strokeStyle = "rgb(200,200,200)"; // wall or nothing
      }
      if(e.sensed_type === 1) { ctx.strokeStyle = "rgb(255,150,150)"; } // apples
      if(e.sensed_type === 2) { ctx.strokeStyle = "rgb(150,255,150)"; } // poison
      ctx.beginPath();
      ctx.moveTo(a.op.x, a.op.y);
      ctx.lineTo(a.op.x + sr * Math.sin(a.oangle + e.angle),
                 a.op.y + sr * Math.cos(a.oangle + e.angle));
      ctx.stroke();
    }
  }

  // draw items
  ctx.strokeStyle = "rgb(0,0,0)";
  if(!agentView) {
    for(var i=0,n=w.items.length;i<n;i++) {
      var it = w.items[i];
      if(it.type === 1) ctx.fillStyle = "rgb(255, 150, 150)";
      if(it.type === 2) ctx.fillStyle = "rgb(150, 255, 150)";
      ctx.beginPath();
      ctx.arc(it.p.x, it.p.y, it.rad, 0, Math.PI*2, true);
      ctx.fill();
      ctx.stroke();
    }
  }
}

// Tick the world
var smooth_reward_history = []; // [][];
var smooth_reward = [];
var flott = 0;
function tick() {

  function updateWorld() {
    w.tick();
    draw();
    updateStats();

    flott += 1;
    for(i=0; i<w.agents.length; i++) {
      var rew = w.agents[i].last_reward;
      if(!smooth_reward[i]) { smooth_reward[i] = 0; }
      smooth_reward[i] = smooth_reward[i] * 0.999 + rew * 0.001;
      if(flott === 50) {
        // record smooth reward
        if(smooth_reward_history[i].length >= nflot) {
          smooth_reward_history[i] = smooth_reward_history[i].slice(1);
        }
        smooth_reward_history[i].push(smooth_reward[i]);
      }
    }
    if(flott === 50) {
      flott = 0;
    }

    var agent = w.agents[0];
    if(typeof agent.expi !== 'undefined') {
      $("#expi").html(agent.expi);
    }
    if(typeof agent.tderror !== 'undefined') {
      $("#tde").html(agent.tderror.toFixed(3));
    }
    for(var i=0,n=w.agents.length;i<n;i++) {
      w.agents[i].backward(function() {
        if(running) {
          setTimeout(tick, delay);
        }
      });
    }
  }

  for(var i=0,n=w.agents.length;i<n;i++) {
    w.agents[i].forward(updateWorld);
  }
}

// flot stuff
var nflot = 1000;
function initFlot() {
  var container = $("#flotreward");
  var res = getFlotRewards(0);
  var res1 = getFlotRewards(1);
  var series = [{
    data: res,
    lines: {fill: true}
  }, {
    data: res1,
    lines: {fill: true}
  }];
  var plot = $.plot(container, series, {
    grid: {
      borderWidth: 1,
      minBorderMargin: 20,
      labelMargin: 10,
      backgroundColor: {
        colors: ["#FFF", "#e4f4f4"]
      },
      margin: {
        top: 10,
        bottom: 10,
        left: 10,
      }
    },
    xaxis: {
      min: 0,
      max: nflot
    },
    yaxis: {
      min: -0.1,
      max: 0.1
    }
  });
  setInterval(function(){
    for(var i=0; i<w.agents.length; i++) {
      series[i].data = getFlotRewards(i);
    }
    plot.setData(series);
    plot.draw();
  }, 100);
}
function getFlotRewards(agentId) {
  // zip rewards into flot data
  var res = [];
  if(agentId >= w.agents.length || !smooth_reward_history[agentId]) {
    return res;
  }
  for(var i=0,n=smooth_reward_history[agentId].length;i<n;i++) {
    res.push([i, smooth_reward_history[agentId][i]]);
  }
  return res;
}

function toggleAgentView() {
  agentView = !agentView;
}

var jaxrendered = false;
function renderJax() {
  if(jaxrendered) { return; }
  (function () {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src  = "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML";
    document.getElementsByTagName("head")[0].appendChild(script);
    jaxrendered = true;
  })();
}

function updateStats() {
  var stats = "";
  for(var i=0; i<w.agents.length; i++) {
    stats += "Player " + (i+1) + ": " +
      w.agents[i].apples + " apples, " +
      w.agents[i].poison + " poison, " +
      w.agents[i].getSuccessRate() + " ratio";
  }
  $("#apples_and_poison").html(stats);
}

function stopGame() {
  running = false;
}

function startGame() {
  if(!running) {
    running = true;
    tick();
  }
}

function resetAgent() {
  stopGame();
  eval($("#agentspec").val());
  w.agents[0].initBrain(env, spec, startGame);
}

function resetAgentProgress() {
  w.agents[0].resetProgress();
  updateStats();
}

function loadPretrainedAgent() {
  stopGame();
  var agent = w.agents[0];
  var callback = function(data) {
    this.epsilon = 0.05;
    $("#slider").slider('value', this.epsilon);
    $("#eps").html(this.epsilon.toFixed(2));
    this.alpha = 0;
    startGame();
  }.bind(agent);
  eval($("#agentspec").val());
  // kill learning rate to not learn
  spec.epsilon = 0.05
  spec.alpha = 0.0
  agent.loadPretrainedBrain(agent, spec, callback);
}

function fetchSavedBrains() {
  var agent = w.agents[0];
  var callback = function(data) {
    savedBrainsModel.clearBrains();
    for(var brainNumber in data) {
      savedBrainsModel.addBrain(data[brainNumber]);
    }
  };
  agent.fetchBrains(callback);
}

function loadBrain(brain) {
  stopGame();
  var agent = w.agents[0];
  var callback = function(data) {
    this.epsilon = spec.epsilon;
    this.alpha = spec.alpha;
    $("#slider").slider('value', this.epsilon);
    $("#eps").html(this.epsilon.toFixed(2));
    startGame();
  }.bind(agent);
  eval($("#agentspec").val());
  agent.loadBrain(agent, spec, brain.id, callback);
}

function deleteBrain(brain) {
  var agent = w.agents[0];
  agent.deleteBrain(brain.id);
}

function saveAgent() {
  var agent = w.agents[0];
  agent.saveBrain();
}

var w; // global world object
var env;
var spec = {};
var running = false;
var delay = 0;
function start() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  eval($("#agentspec").val());

  w = new World();
  w.agents = [];
  for(var k = 0; k < 1; k++) {
    var a = new Agent();
    env = a;
    a.initBrain(env, spec, setupGame);
    w.agents.push(a);
    smooth_reward_history.push([]);
  }
}

function setupGame() {
  $( "#slider" ).slider({
    min: 0,
    max: 1,
    value: w.agents[0].epsilon,
    step: 0.01,
    slide: function(event, ui) {
      w.agents[0].setEpsilon(ui.value);
      $("#eps").html(ui.value.toFixed(2));
    }
  });
  $( "#delaySlider" ).slider({
    min: 0,
    max: 500,
    value: delay,
    step: 10,
    slide: function(event, ui) {
      delay = ui.value;
      $("#delay").html(ui.value);
    }
  });
  $("#eps").html(w.agents[0].epsilon.toFixed(2));
  $("#slider").slider('value', w.agents[0].epsilon);
  $("#delay").html(delay);
  $("#delaySlider").slider('value', delay);

  initFlot();

  // render markdown
  $(".md").each(function(){
    $(this).html(marked($(this).html()));
  });
  renderJax();
  startGame();
}

function updateSpec() {
  eval($("#agentspec").val());
  w.agents[0].updateSpec(spec);
  $("#eps").html(spec.epsilon.toFixed(2));
  $("#slider").slider('value', spec.epsilon);
}

var SavedBrain = function(data) {
  this.successRate = data.success;
  this.epsilon = data.epsilon;
  this.alpha = data.alpha;
  this.timestamp = data.timestamp;
  this.id = data._id;
};

var SavedBrainsModel = function() {
  var self = this;
  self.savedBrains = ko.observableArray([]);

  self.addBrain = function(brain) {
    self.savedBrains.push(new SavedBrain(brain));
  };
  self.clearBrains = function() {
    self.savedBrains.removeAll();
  };
  self.deleteBrain = function(brain) {
    self.savedBrains.remove(function(item) {
      return item.id === brain.id;
    });
    deleteBrain(brain);
  };
  self.loadBrain = loadBrain;
};

var savedBrainsModel = new SavedBrainsModel();

$(ko.applyBindings(savedBrainsModel, document.getElementById('savedBrains')));
