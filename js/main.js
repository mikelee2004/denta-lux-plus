// ======================================
// DENTA-LUXE+ Main JS
// Общие интерактивности: navbar, анимации, отзывы, аккордеон, формы.
// ======================================

document.addEventListener("DOMContentLoaded", () => {
  initMouseBackgroundGlow();
  initNavbar();
  initScrollAnimations();
  initReviewsSlider();
  initAccordions();
  initForms();
});

// --------------------------------------
// Background glow follow mouse (all pages)
// JS обновляет CSS-переменные --mx/--my
// --------------------------------------
function initMouseBackgroundGlow() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  if (prefersReducedMotion || !hasFinePointer) return;

  const root = document.documentElement;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 3;

  let currentX = targetX;
  let currentY = targetY;

  const ease = 0.08; // плавность (меньше = медленнее)

  const update = () => {
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;

    root.style.setProperty("--mx", `${currentX}px`);
    root.style.setProperty("--my", `${currentY}px`);

    requestAnimationFrame(update);
  };

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  }, { passive: true });

  update();
}

// --------------------------------------
// Navbar: scrolled state + burger menu
// --------------------------------------
function initNavbar() {
  const header = document.querySelector(".site-header");
  const navbar = document.querySelector(".navbar");
  const burger = document.querySelector(".burger");

  if (header) {
    const onScroll = () => {
      if (window.scrollY > 50) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (burger && navbar) {
    burger.addEventListener("click", () => {
      const isOpen = navbar.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(isOpen));
    });

    // Закрываем меню при клике по ссылке (mobile UX)
    const links = navbar.querySelectorAll(".nav-link");
    links.forEach((link) => {
      link.addEventListener("click", () => {
        navbar.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }
}

// --------------------------------------
// Scroll animations (IntersectionObserver)
// .animate-on-scroll -> .is-visible
// --------------------------------------
function initScrollAnimations() {
  const items = document.querySelectorAll(".animate-on-scroll");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  items.forEach((el) => observer.observe(el));
}

// --------------------------------------
// Reviews slider (index.html)
// Показ 1 отзыва + управление кнопками
// --------------------------------------
function initReviewsSlider() {
  const slider = document.querySelector(".reviews-slider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".review"));
  const prevBtn = slider.querySelector(".slider-btn-prev");
  const nextBtn = slider.querySelector(".slider-btn-next");
  const dotsContainer = slider.querySelector(".reviews-dots");
  if (!slides.length || !prevBtn || !nextBtn || !dotsContainer) return;

  dotsContainer.innerHTML = "";

  let currentIndex = 0;

  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "reviews-dot";
    dot.setAttribute("aria-label", `Показать отзыв ${i + 1}`);
    dot.addEventListener("click", () => showSlide(i));
    dotsContainer.appendChild(dot);
    return dot;
  });

  function showSlide(index) {
    const total = slides.length;
    currentIndex = (index + total) % total;

    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === currentIndex);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === currentIndex);
    });
  }

  prevBtn.addEventListener("click", () => showSlide(currentIndex - 1));
  nextBtn.addEventListener("click", () => showSlide(currentIndex + 1));
  showSlide(0);
}

// --------------------------------------
// Services accordion (services.html)
// Один открытый элемент за раз
// --------------------------------------
function initAccordions() {
  const accordions = document.querySelectorAll("[data-accordion]");
  if (!accordions.length) return;

  accordions.forEach((accordion) => {
    const items = accordion.querySelectorAll("[data-accordion-item]");

    items.forEach((item) => {
      const header = item.querySelector("[data-accordion-header]");
      const body = item.querySelector("[data-accordion-body]");
      if (!header || !body) return;

      header.setAttribute("role", "button");
      header.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");

        items.forEach((other) => {
          if (other === item) return;
          other.classList.remove("is-open");
          const otherBody = other.querySelector("[data-accordion-body]");
          if (otherBody) otherBody.style.maxHeight = "0px";
          const otherHeader = other.querySelector("[data-accordion-header]");
          if (otherHeader) otherHeader.setAttribute("aria-expanded", "false");
        });

        if (isOpen) {
          item.classList.remove("is-open");
          body.style.maxHeight = "0px";
          header.setAttribute("aria-expanded", "false");
        } else {
          item.classList.add("is-open");
          body.style.maxHeight = body.scrollHeight + "px";
          header.setAttribute("aria-expanded", "true");
        }
      });
    });
  });
}

// --------------------------------------
// Forms: validation + phone mask + success state
// data-form-type="appointment" | "doctor" | "feedback"
// --------------------------------------
function initForms() {
  const forms = document.querySelectorAll("form[data-form-type]");
  if (!forms.length) return;

  const phoneInputs = document.querySelectorAll("input[data-phone-input]");
  phoneInputs.forEach((input) => {
    input.addEventListener("input", onPhoneInput);
    input.addEventListener("blur", onPhoneBlur);
  });

  forms.forEach((form) => {
    const successBlock = form.querySelector(".form-success");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const valid = validateForm(form);

      if (!valid) return;

      form.classList.add("is-submitted");
      if (successBlock) successBlock.classList.add("is-visible");
    });
  });
}

function validateForm(form) {
  let valid = true;

  // Проверяем все required-поля внутри формы
  const requiredFields = form.querySelectorAll("[required]");
  requiredFields.forEach((field) => {
    field.classList.remove("is-invalid");

    if (field.type === "checkbox") {
      if (!field.checked) {
        field.classList.add("is-invalid");
        valid = false;
      }
      return;
    }

    if (!field.value || !field.value.trim()) {
      field.classList.add("is-invalid");
      valid = false;
    }
  });

  // Доп. проверка телефона, если есть поле name="phone"
  const phone = form.querySelector('input[name="phone"]');
  if (phone && phone.value) {
    if (!isValidPhone(phone.value)) {
      phone.classList.add("is-invalid");
      valid = false;
    }
  }

  return valid;
}

function onPhoneInput(event) {
  const input = event.target;
  const digitsRaw = input.value.replace(/\D/g, "");

  // Нормализуем: если это 8-ка в начале, заменим на 7
  let digits = digitsRaw;
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);

  // Если ввели без кода страны — добавим 7
  if (digits.length > 0 && !digits.startsWith("7")) digits = "7" + digits;

  digits = digits.slice(0, 11);

  const pick = (i) => digits[i] || "_";

  // digits[0] = 7
  const formatted = `+7 (${pick(1)}${pick(2)}${pick(3)}) ${pick(4)}${pick(5)}${pick(6)}-${pick(7)}${pick(8)}-${pick(9)}${pick(10)}`;
  input.value = formatted;
}

function onPhoneBlur(event) {
  const input = event.target;
  if (!input.value) return;
  if (!isValidPhone(input.value)) input.classList.add("is-invalid");
  else input.classList.remove("is-invalid");
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("7");
}

