(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#contact-form");
    if (!form) return;

    const output = document.querySelector("#form-output");
    const popup = document.querySelector("#success-popup");
    const popupCloseBtn = popup ? popup.querySelector(".success-popup-close") : null;
    const submitBtn = form.querySelector("button[type='submit']");

    const fields = ["firstName", "lastName", "email", "phone", "address"];


    const sliders = [
      { input: "rating1", value: "rating1-value" },
      { input: "rating2", value: "rating2-value" },
      { input: "rating3", value: "rating3-value" }
    ];

    sliders.forEach(s => {
      const input = document.getElementById(s.input);
      const value = document.getElementById(s.value);
      input.addEventListener("input", () => value.textContent = input.value);
    });

    
    fields.forEach(id => {
      const input = form[id];
      input.addEventListener("input", () => {
        validateField(input);
        updateSubmitState();
      });
    });

    function validateField(input) {
      const value = input.value.trim();
      clearError(input);

      if (value === "") {
        setError(input, "Šis laukelis privalomas");
        return false;
      }

      if (input.id === "email" && !validateEmail(value)) {
        setError(input, "Neteisingas el. pašto formatas");
        return false;
      }

      if (input.id === "phone" && !validatePhone(value)) {
        setError(input, "Neteisingas telefono numeris");
        return false;
      }

      return true;
    }

    function validateAllFields() {
      let ok = true;
      fields.forEach(id => {
        const fieldOk = validateField(form[id]);
        if (!fieldOk) ok = false;
      });

      if (
        form.rating1.value < 1 ||
        form.rating2.value < 1 ||
        form.rating3.value < 1
      ) {
        ok = false;
      }

      return ok;
    }

    function updateSubmitState() {
      submitBtn.disabled = !validateAllFields();

      if (submitBtn.disabled) {
        submitBtn.style.opacity = "0.5";
        submitBtn.style.cursor = "not-allowed";
      } else {
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
      }
    }

    updateSubmitState();

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!validateAllFields()) {
        showError("Prašome pataisyti klaidas formoje.");
        return;
      }

      const formData = {
        firstName: form.firstName.value.trim(),
        lastName: form.lastName.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        address: form.address.value.trim(),
        rating1: Number(form.rating1.value),
        rating2: Number(form.rating2.value),
        rating3: Number(form.rating3.value)
      };

      const ratings = [formData.rating1, formData.rating2, formData.rating3];
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      formData.average = avg.toFixed(1);

      console.log("Kontaktų formos duomenys:", formData);

      output.innerHTML = `
        <h4>Jūsų pateikti duomenys</h4>
        <p><strong>Vardas:</strong> ${formData.firstName}</p>
        <p><strong>Pavardė:</strong> ${formData.lastName}</p>
        <p><strong>El. paštas:</strong> ${formData.email}</p>
        <p><strong>Tel. numeris:</strong> ${formData.phone}</p>
        <p><strong>Adresas:</strong> ${formData.address}</p>
        <p><strong>Įvertinimai:</strong> ${formData.rating1}, ${formData.rating2}, ${formData.rating3}</p>
        <p><strong>Vidurkis:</strong> ${formData.firstName} ${formData.lastName}: ${formData.average}</p>
      `;

      showSuccessPopup("Duomenys pateikti sėkmingai!");

      form.reset();
      sliders.forEach(s => {
        document.getElementById(s.value).textContent = "5";
      });

      updateSubmitState();
    });

    if (popup && popupCloseBtn) {
      popupCloseBtn.addEventListener("click", () => popup.classList.remove("show"));
      popup.addEventListener("click", (e) => {
        if (e.target === popup) popup.classList.remove("show");
      });
    }
  });
})();


function showError(message) {
  const popup = document.querySelector("#success-popup");
  const textEl = popup.querySelector("p");

  textEl.textContent = message;
  popup.classList.add("show");

  popup.querySelector(".success-popup-inner").style.borderColor = "#ff4f4f";
  textEl.style.color = "#ff4f4f";

  setTimeout(() => {
    popup.classList.remove("show");
    popup.querySelector(".success-popup-inner").style.borderColor = "";
    textEl.style.color = "";
  }, 2000);
}

function setError(input, message) {
  let small = input.parentElement.querySelector(".error-msg");

  if (!small) {
    small = document.createElement("small");
    small.classList.add("error-msg");
    input.parentElement.appendChild(small);
  }

  input.classList.add("error");
  small.style.display = "block";
  small.textContent = message;
}

function clearError(input) {
  const small = input.parentElement.querySelector(".error-msg");
  input.classList.remove("error");
  if (small) small.style.display = "none";
}

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function validatePhone(phone) {
  return /^(\+?\d{8,14})$/.test(phone);
}
