
$(function () {
    // Get the updateRating.
    const updateRatingForm = $('#ratingForm');
    updateRatingForm.submit(function (event) {
        // Stop the browser from submitting the registerForm.
        event.preventDefault();
        const formData = updateRatingForm.serialize();
        $.ajax({
            type: 'POST',
            url: updateRatingForm.attr('action'),
            data: formData
        }).done(function (response) {
            if (response.error) {
                $("#ratingForm-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                    + "You haven't modified your rating"
                    + "</div>");
            } else {
                $("#ratingForm-message").html("<div class=\"alert alert-success\" role=\"alert\">"
                    + "You rating as been updated with success"
                    + "</div>");
                navigatedLocation();
            }
        }).fail(function () {
            $("#ratingForm-message").html("<div class=\"alert alert-danger\" role=\"alert\">"
                + "An unexpected error has occurred. Please contact the Administrator"
                + "</div>");
        })
    });
});