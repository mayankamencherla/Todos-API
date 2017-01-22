var env = process.env.NODE_ENV || 'development'; // environment variable, def: dev
console.log('env ******', env);

// if env is dev, then use TodoApp
// if env is test, then use TodoAppTest
if (env === 'development'){
    process.env.PORT = 3000;
    process.env.MONGODB_URI =  'mongodb://localhost:27017/TodoApp';
} else if (env === 'test'){
    process.env.PORT = 3000;
    process.env.MONGODB_URI =  'mongodb://localhost:27017/TodoAppTest';
}