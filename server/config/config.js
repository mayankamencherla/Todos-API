var env = process.env.NODE_ENV || 'development'; // environment variable, def: dev
console.log('env ******', env);

if (env === 'development' || env === 'test'){
    const config = require('./config.json');
    var envConfig = config[env]; // gets the env variables
    
    // setting config variables
    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
    });
}