const app        = require('./app');

app.set('port', process.env.PORT || 8000);
app.listen(app.get('port') ,async()=>{
    console.log(`server listen on port ${app.get('port')}`);
});