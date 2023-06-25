EP_APP ?= rljs-service

clean:
	# delete mongo_db/ and node_modules/
	rm -rf mongo_db node_modules

deploy: clean
	-epinio app delete $(EP_APP)
	epinio app create $(EP_APP)
	# create environment.yml file from environment_dev.yml file
	cat environment_dev.yml | grep -v '#dev' > environment.yml
	
	# create epinio service instances
	-epinio service create mongodb-dev $(EP_APP)_mongodb
	
	# check if service is created
	epinio service show $(EP_APP)_mongodb | grep Status | grep deployed || sleep 30

	# bind service to app	
	epinio service bind $(EP_APP)_mongodb $(EP_APP)

	# push app   --builder-image gcr.io/buildpacks/builder:google-22
	epinio push --name $(EP_APP) \
		-e MONGODB_CONFIG=$$(epinio configurations list | grep $(EP_APP)_mongodb | awk '{print $$2}')

	# delete tmp files
	rm -f environment.yml

undeploy:
	-epinio app delete $(EP_APP)
	-epinio service delete $(EP_APP)_mongodb
