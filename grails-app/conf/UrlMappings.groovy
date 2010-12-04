class UrlMappings {

	static mappings = {
		"/$controller/$action?/$id?"{
			constraints {
				// apply constraints here
			}
		}

		"/"(uri:"/grooxdoo/source/index.html")
		"500"(view:'/error')
	}
}
