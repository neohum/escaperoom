const userRoute = require('./v1/user.route');
const authRoute = require('./v1/auth.route');
const helloRoute = require('./v1/hello.route');
const mainContentsRoute = require('./v1/main_contents.route');  
const uploadsRoute = require('./v1/uploads.route'); // 업로드 라우트 추가
const contentsRoute = require('./v1/contents.route'); // 콘텐츠 라우트 추가
const uploadRoute = require('./v1/upload.route'); // 업로드 라우트 추가

// 라우트 등록 로그
console.log('Route manager loaded');

const routeManager = (app) => {
    console.log('Registering routes in route manager...');
    
    // API V1 Routes
    app.use('/v1/', helloRoute);
    app.use('/v1/auth', authRoute);
    app.use('/v1/user', userRoute);
    app.use('/v1/main-contents', mainContentsRoute);
    app.use('/v1/uploads', uploadsRoute); // 업로드 라우트 추가
    app.use('/v1/upload', uploadRoute); // 업로드 라우트 추가
    app.use('/v1/contents', contentsRoute); // 콘텐츠 라우트 추가

    
    console.log('Routes registered:');
    console.log('- /v1/ (hello)');
    console.log('- /v1/auth');
    console.log('- /v1/user');
    console.log('- /v1/main-contents');
    console.log('- /v1/uploads');
    console.log('- /v1/upload');
    console.log('- /v1/contents');
};

module.exports = routeManager;
