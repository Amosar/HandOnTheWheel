$(function () {
    // Manage the register form.
    const registerForm = $('#registerForm');
    $(registerForm).submit(function (event) {
        // Stop the browser from submitting the registerForm.
        event.preventDefault();
        //Serialize the data and get password value
        const formData = $(this).serialize();
        const password = $(this).find(":input[name=password]")[0].value;
        const confirmPassword = $(this).find(":input[name=confirmPassword]")[0].value;
        if (password !== confirmPassword) {
            $("#register-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + "the passwords doesn't match"
                + "</div>");
            return;
        }

        //Create and run the ajax method to register the user
        $.ajax({
            type: 'POST',
            url: $(registerForm).attr('action'),
            data: formData
        }).done(function (response) { //If the server return 200 status
            if (response.error) {
                $("#register-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                    + response.message
                    + "</div>");
            } else {
                //Open the login modal with a message and close the register modal
                $("#login-message").html("<div class=\"alert alert-success\" role=\"alert\">"
                    + "you are registered, you can now log in to the website"
                    + "</div>");
                $("#register-message").html("");
                $("#modalLogin").modal();
                $("#modalRegister").modal("hide");
            }
        }).fail(function (data) { //If the browser return a bad status (status other than 200)
            let param = data.responseJSON.param;
            if (param === undefined) param = "";
            $("#register-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + data.responseJSON.message + param
                + "</div>");
        });
    });

    // Manage the login form
    const loginForm = $('.loginForm');
    $(loginForm).submit(function (event) {
        // Stop the browser from submitting the loginForm.
        event.preventDefault();
        const formData = $(this).serialize();

        //Create and run the ajax method to log the user
        $.ajax({
            type: 'POST',
            url: $(loginForm).attr('action'),
            data: formData
        }).done(function (response) {
            if (response.error) {
                $(".login-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                    + response.message
                    + "</div>");
            } else {
                //reload the page to update the element that need an authentication
                window.location.reload();
            }
        }).fail(function (data) {
            let param = data.responseJSON.param;
            if (param === undefined) param = "";
            $(".login-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + data.responseJSON.message + param
                + "</div>");
        });
    });

    // Manage the delete account form
    const deleteAccountForm = $('#deleteAccountForm');
    $(deleteAccountForm).submit(function (event) {
        // Stop the browser from submitting the loginForm.
        event.preventDefault();
        const formData = $(this).serialize();

        //Create and run the ajax method to delete the user account
        $.ajax({
            type: 'POST',
            url: $(deleteAccountForm).attr('action'),
            data: formData
        }).done(function (response) {
            if (response.error) {
                $("#deleteAccount-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                    + response.message
                    + "</div>");
            } else {
                // Redirect the user to the home page when his account is delete
                window.location = "/";
            }
        }).fail(function (data) {
            let param = data.responseJSON.param;
            if (param === undefined) param = "";
            $("#deleteAccount-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + data.responseJSON.message + param
                + "</div>");
        });
    });

    // Manage the change password form
    const changePasswordForm = $('#changePasswordForm');
    $(changePasswordForm).submit(function (event) {
        // Stop the browser from submitting the loginForm.
        event.preventDefault();
        //Serialize the data and get password value
        const formData = $(this).serialize();
        const currentPassword = $(changePasswordForm).find(":input[name=oldPassword]")[0].value;
        const newPassword = $(changePasswordForm).find(":input[name=newPassword]")[0].value;
        const confirmNewPassword = $(changePasswordForm).find(":input[name=confirmNewPassword]")[0].value;
        if (currentPassword === newPassword) {
            $("#changePasswordForm-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + "You new password need to different from the old"
                + "</div>");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            $("#changePasswordForm-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + "the passwords doesn't match"
                + "</div>");
            return;
        }

        //Create and run the ajax method to change the password of the user
        $.ajax({
            type: 'POST',
            url: $(changePasswordForm).attr('action'),
            data: formData
        }).done(function (response) {
            if (response.error) {
                $("#changePasswordForm-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                    + response.message
                    + "</div>");
            } else {
                $("#changePasswordForm-message").html("<div class=\"alert alert-success\" role=\"alert\">"
                    + response.message
                    + "</div>");
                //reset the form after the password change
                $(changePasswordForm).trigger("reset");

            }
        }).fail(function (data) {
            let param = data.responseJSON.param;
            if (param === undefined) param = "";
            $("#changePasswordForm-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + data.responseJSON.message + param
                + "</div>");
        });
    });
});