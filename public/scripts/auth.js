$(function () {
    // Get the registerForm.
    const registerForm = $('#registerForm');
    $(registerForm).submit(function (event) {
        // Stop the browser from submitting the registerForm.
        event.preventDefault();
        const formData = $(registerForm).serialize();
        const password = $(registerForm).find(":input[name=password]")[0].value;
        const confirmPassword = $(registerForm).find(":input[name=confirmPassword]")[0].value;
        if (password !== confirmPassword) {
            $("#register-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + "the passwords doesn't match"
                + "</div>");
            return;
        }

        $.ajax({
            type: 'POST',
            url: $(registerForm).attr('action'),
            data: formData
        }).done(function (response) {
            if (response.error) {
                $("#register-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                    + response.message
                    + "</div>");
            } else {
                $("#login-message").html("<div class=\"alert alert-success\" role=\"alert\">"
                    + "you are registered, you can now log in to the website"
                    + "</div>");
                $("#register-message").html("");
                $("#modalLogin").modal();
                $("#modalRegister").modal("hide");
            }
        }).fail(function (data) {
            $("#register-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + data.responseJSON.message + data.responseJSON.param
                + "</div>");
        });
    });

    const loginForm = $('#loginForm');
    $(loginForm).submit(function (event) {
        // Stop the browser from submitting the loginForm.
        event.preventDefault();
        const formData = $(loginForm).serialize();

        $.ajax({
            type: 'POST',
            url: $(loginForm).attr('action'),
            data: formData
        }).done(function (response) {
            console.log(response);
            if (response.error) {
                $("#login-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                    + response.message
                    + "</div>");
            } else {
                window.location.reload();
            }
        });
    });
});