window.validation = {
    checkMatchOtherField: function checkMatchOtherField(field) {
        var otherField = document.getElementById(field.dataset.matches);
        var matches = field.value === otherField.value;

        if (!matches) {
            var message = field.dataset.matchesMessage || 'Please check both fields match';
            field.setCustomValidity(message);
        } else {
            field.setCustomValidity('');
        }
    },

    getMessage: function getMessage(field) {
        var validity = field.validity;

        if (validity.customError) {
            return field.dataset.matchesMessage || 'The value you entered for this field is invalid.';
        }

        // If field is required and empty
        if (validity.valueMissing) {
            return field.dataset.requiredMessage || 'Please fill out this field.';
        }

        // If not the right type
        if (validity.typeMismatch) {

            // Email
            if (field.type === 'email') {
                return field.dataset.emailMessage || 'Please enter a valid email address.';
            }

            // URL
            if (field.type === 'url') {
                return field.dataset.urlMessage || 'Please enter a URL.';
            }

        }

        // If too short
        if (validity.tooShort) {
            return field.dataset.minlengthMessage || 'Please lengthen this text to ' + field.getAttribute('minLength') + ' characters or more. You are currently using ' + field.value.length + ' characters.';
        }

        // If too long
        if (validity.tooLong) {
            return field.dataset.maxlengthMessage || 'Please shorten this text to no more than ' + field.getAttribute('maxLength') + ' characters. You are currently using ' + field.value.length + ' characters.';
        }

        // If number input isn't a number
        if (validity.badInput) return 'Please enter a number.';

        // If a number value doesn't match the step interval
        if (validity.stepMismatch) return 'Please select a valid value.';

        // If a number field is over the max
        if (validity.rangeOverflow) return 'Please select a value that is no more than ' + field.getAttribute('max') + '.';

        // If a number field is below the min
        if (validity.rangeUnderflow) return 'Please select a value that is no less than ' + field.getAttribute('min') + '.';

        // If pattern doesn't match
        if (validity.patternMismatch) {

            // If pattern info is included, return custom error
            if (field.hasAttribute('title')) return field.getAttribute('title');

            // Otherwise, generic error
            return 'Please match the requested format.';

        }

        // If all else fails, return a generic catchall error
        return 'The value you entered for this field is invalid.';
    },

    hasError: function hasError(field) {
        // Don't validate submits, buttons, file and reset inputs, and disabled fields
        if (
            field.disabled
            || field.type === 'file'
            || field.type === 'reset'
            || field.type === 'submit'
            || field.type === 'button'
        ) {
            return;
        }

        if (field.getAttribute('data-matches')) {
            this.checkMatchOtherField(field);
        }

        // Get validity
        var validity = field.validity;

        // If valid return null
        if (validity.valid) {
            return;
        }

        return this.getMessage(field);
    },

    showError: function showError(field, error) {
        field.classList.add(this.classes.error);

        if (field.type === 'radio' && field.name) {
            var group = document.getElementsByName(field.name);

            if (group.length > 0) {
                for (var i = 0; i < group.length; i++) {
                    // Only check fields in current form
                    if (group[i].form !== field.form) {
                        continue;
                    }
                    group[i].classList.add(this.classes.error);
                }
                field = group[group.length - 1];
            }
        }

        var id = field.id || field.name;
        if (!id) {
            return;
        }

        var message = field.form.querySelector('label.error[for="' + id + '"]');
        if (!message) {
            message = document.createElement('label');
            message.className = this.classes.error;
            message.setAttribute('for', id);

            var label;
            if (field.type === 'radio' || field.type ==='checkbox') {
                label = field.form.querySelector('label[for="' + id + '"]') || field.parentNode;
                if (label) {
                    label.parentNode.insertBefore(message, label.nextSibling);
                }
            }

            if (!label) {
                field.parentNode.insertBefore(message, field.nextSibling);
            }
        }

        message.innerHTML = error;
        message.style.display = 'block';
        message.style.visibility = 'visible';
    },

    removeError: function removeError(field) {
        field.classList.remove(this.classes.error);

        if (field.type === 'radio' && field.name) {
            var group = document.getElementsByName(field.name);
            if (group.length > 0) {
                for (var i = 0; i < group.length; i++) {
                    // Only check fields in current form
                    if (group[i].form !== field.form) {
                        continue;
                    }
                    group[i].classList.remove('error');
                }
                field = group[group.length - 1];
            }
        }

        var id = field.id || field.name;
        if (!id) {
            return;
        }

        var message = field.form.querySelector('label.' + this.classes.error + '[for="' + id + '"]');
        if (!message) {
            return;
        }

        message.innerHTML = '';
        message.style.display = 'none';
        message.style.visibility = 'hidden';
    },

    validateForm: function validateForm(form) {
        form.setAttribute('novalidate', true);
        form.addEventListener('submit', function (event) {
            var fields = event.target.elements;
            var error;
            var hasErrors = false;

            for (var i = 0; i < fields.length; i++) {
                error = window.qc.auth.hasError(fields[i]);
                if (error) {
                    window.qc.auth.showError(fields[i], error);
                    if (!hasErrors) {
                        hasErrors = fields[i];
                    }
                }
            }

            if (hasErrors) {
                event.preventDefault();
                hasErrors.focus();

                ['keyup', 'blur'].forEach(function (e) {
                    form.addEventListener(e, function (event) {
                        var error = window.qc.auth.hasError(event.target);
                        if (error) {
                            window.qc.auth.showError(event.target, error);
                            return;
                        }

                        window.qc.auth.removeError(event.target);
                    }, true);
                });
            }
        }, false);
    },

    init: function init() {
        var loginForm = document.querySelector('.' + this.classes.loginForm);
        var lostPasswordForm = document.querySelector('.' + this.classes.lostPasswordForm);
        var lostUsernameForm = document.querySelector('.' + this.classes.lostUsernameForm);
        var resetPasswordForm = document.querySelector('.' + this.classes.resetPasswordForm);
        var changeEmailForm = document.querySelector('.' + this.classes.changeEmailForm);
        var registrationForm = document.querySelector('.' + this.classes.registrationForm);

        if (loginForm !== null) {
            this.validateForm(loginForm);
        }

        if (lostPasswordForm !== null) {
            this.validateForm(lostPasswordForm);
        }

        if (lostUsernameForm !== null) {
            this.validateForm(lostUsernameForm);
        }

        if (resetPasswordForm !== null) {
            this.validateForm(resetPasswordForm);
        }

        if (changeEmailForm !== null) {
            this.validateForm(changeEmailForm);
        }

        if (registrationForm !== null) {
            this.validateForm(registrationForm);
        }
    }
};
