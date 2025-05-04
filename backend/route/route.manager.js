const userRoute = require('./v1/user.route');
const authRoute = require('./v1/auth.route');
const helloRoute = require('./v1/hello.route');
// 콘텐츠 라우트는 app.js에서 직접 등록하므로 여기서는 제거
// const contentsRoute = require('./v1/contents.route');

const routeManager = (app) => {
    // API V1 Routes
    app.use('/v1/', helloRoute);
    app.use('/v1/auth', authRoute);
    app.use('/v1/user', userRoute);
    // app.use('/v1/contents', contentsRoute); // 제거
    
    // 콘솔에 등록된 라우트 출력 (디버깅용)
    console.log('Registered routes in routeManager:');
    console.log('- GET /v1/');
    console.log('- /v1/auth routes');
    console.log('- /v1/user routes');
    // console.log('- /v1/contents routes'); // 제거
}

module.exports = routeManager;
