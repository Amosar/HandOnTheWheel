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

        }).fail(function () {

        })
    });
});