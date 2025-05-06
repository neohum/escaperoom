// 정적 파일 제공 설정
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log('Created uploads directory:', uploadPath);
}

app.use('/uploads', express.static(uploadPath));
console.log('Static file serving configured for:', uploadPath);