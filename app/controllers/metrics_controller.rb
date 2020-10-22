class MetricsController < ApplicationController
	action_auth_level :index, :instructor
	def index
	end

private
	def get_current_metrics(course_id)
	end

	def update_current_metrics
		# will use params containing information about the changed risk conditions
	end
end
