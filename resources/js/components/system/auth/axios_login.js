$('#login_form').one('submit', function (e) {
    e.preventDefault();
   
    let res =axios.get('/sanctum/csrf-cookie').then(response => {
        $(this).submit();
    });
    console.log(res);
});
