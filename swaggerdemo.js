module.exports = function (app) {
    const expressSwagger = require('express-swagger-generator')(app)

    let options = {
        swaggerDefinition: {
            info: {
                description: 'Api for AnalyzR',
                title: 'AnalyzR API',
                version: '2.0.0',
            },
            host: 4000,
            basePath: '/api',
            produces: [
                "application/json"
            ],
            // schemes: ['http', 'https'],//
            schemes: ['https'],//
            securityDefinitions: {
                Admin: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-auth-token',
                    description: "",
                },
                User: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-auth-token',
                    description: "",
                },
            }
        },
        route: {
            url: "/api-docs-demo",
            docs: "/api-docs-demo.json"
        },

        basedir: __dirname, //app absolute path
        files: ['./routes/user.js'] //Path to the API handle folder
    }
    expressSwagger(options)

}