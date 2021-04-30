$('#login_form').one('submit', function (e) {
    e.preventDefault();
   
    let res =axios.get('/sanctum/csrf-cookie').then(response => {
        alert("hold up");
        $(this).submit();
    });
    console.log(res);
});
