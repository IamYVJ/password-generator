(() => {
    "use strict";
  
    const CHARSETS = {
      uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ",
      lowercase: "abcdefghijkmnopqrstuvwxyz",
      numbers: "23456789",
      symbols: "!@#$%^&*()_+{}[]:;<>,.?/~-=|\\"
    };
  
    const SIMILAR_CHARACTERS = new Set(["O", "0", "o", "I", "l", "1", "|"]);
    const THEME_STORAGE_KEY = "password-generator-theme";
  
    const elements = {
      form: document.getElementById("password-form"),
      passwordOutput: document.getElementById("password-output"),
      generateButton: document.getElementById("generate-button"),
      copyButton: document.getElementById("copy-button"),
      passwordLength: document.getElementById("password-length"),
      lengthValue: document.getElementById("length-value"),
      includeUppercase: document.getElementById("include-uppercase"),
      includeLowercase: document.getElementById("include-lowercase"),
      includeNumbers: document.getElementById("include-numbers"),
      includeSymbols: document.getElementById("include-symbols"),
      excludeSimilar: document.getElementById("exclude-similar"),
      extraCharacters: document.getElementById("extra-characters"),
      statusMessage: document.getElementById("status-message"),
      validationMessage: document.getElementById("validation-message"),
      strengthText: document.getElementById("strength-text"),
      strengthMeterFill: document.getElementById("strength-meter-fill"),
      themeToggle: document.getElementById("theme-toggle"),
      themeToggleText: document.getElementById("theme-toggle-text"),
      themeIcon: document.getElementById("theme-icon")
    };
  
    const state = {
      statusTimer: null,
      copyButtonTimer: null
    };
  
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  
    function safeGetStoredTheme() {
      try {
        return localStorage.getItem(THEME_STORAGE_KEY);
      } catch {
        return null;
      }
    }
  
    function safeSetStoredTheme(theme) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        return;
      }
    }
  
    function hasStoredTheme() {
      const storedTheme = safeGetStoredTheme();
      return storedTheme === "light" || storedTheme === "dark";
    }
  
    function getSystemTheme() {
      return prefersDarkScheme.matches ? "dark" : "light";
    }
  
    function getInitialTheme() {
      const storedTheme = safeGetStoredTheme();
      return storedTheme === "light" || storedTheme === "dark" ? storedTheme : getSystemTheme();
    }
  
    function applyTheme(theme, persist = false) {
      document.documentElement.setAttribute("data-theme", theme);
  
      const isDark = theme === "dark";
      elements.themeToggle.setAttribute("aria-pressed", String(isDark));
      elements.themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
      elements.themeToggleText.textContent = isDark ? "Light mode" : "Dark mode";
      elements.themeIcon.textContent = isDark ? "☀" : "☾";
  
      if (persist) {
        safeSetStoredTheme(theme);
      }
    }
  
    function handleThemeToggle() {
      const currentTheme = document.documentElement.getAttribute("data-theme") || getSystemTheme();
      applyTheme(currentTheme === "dark" ? "light" : "dark", true);
    }
  
    function subscribeToSystemThemeChanges() {
      const onThemeChange = (event) => {
        if (!hasStoredTheme()) {
          applyTheme(event.matches ? "dark" : "light");
        }
      };
  
      if (typeof prefersDarkScheme.addEventListener === "function") {
        prefersDarkScheme.addEventListener("change", onThemeChange);
      } else if (typeof prefersDarkScheme.addListener === "function") {
        prefersDarkScheme.addListener(onThemeChange);
      }
    }
  
    function updateLengthValue() {
      const value = elements.passwordLength.value;
      elements.lengthValue.value = value;
      elements.lengthValue.textContent = value;
    }
  
    function uniqueCharacters(value) {
      return Array.from(new Set(Array.from(value))).join("");
    }
  
    function normalizeExtraCharacters(value) {
      return uniqueCharacters(
        Array.from((value || "").normalize("NFKC"))
          .filter((character) => !/\s/.test(character))
          .join("")
      );
    }
  
    function filterCharacters(characters, excludeSimilar) {
      const filtered = Array.from(characters).filter((character) => {
        return !excludeSimilar || !SIMILAR_CHARACTERS.has(character);
      });
  
      return uniqueCharacters(filtered.join(""));
    }
  
    function getOptions() {
      return {
        length: Number(elements.passwordLength.value),
        includeUppercase: elements.includeUppercase.checked,
        includeLowercase: elements.includeLowercase.checked,
        includeNumbers: elements.includeNumbers.checked,
        includeSymbols: elements.includeSymbols.checked,
        excludeSimilar: elements.excludeSimilar.checked,
        extraCharacters: elements.extraCharacters.value
      };
    }
  
    function getSelectedSets(options) {
      const requiredSets = [];
  
      if (options.includeUppercase) {
        requiredSets.push(filterCharacters(CHARSETS.uppercase, options.excludeSimilar));
      }
  
      if (options.includeLowercase) {
        requiredSets.push(filterCharacters(CHARSETS.lowercase, options.excludeSimilar));
      }
  
      if (options.includeNumbers) {
        requiredSets.push(filterCharacters(CHARSETS.numbers, options.excludeSimilar));
      }
  
      if (options.includeSymbols) {
        requiredSets.push(filterCharacters(CHARSETS.symbols, options.excludeSimilar));
      }
  
      const extraCharacters = filterCharacters(
        normalizeExtraCharacters(options.extraCharacters),
        options.excludeSimilar
      );
  
      const pool = uniqueCharacters(requiredSets.join("") + extraCharacters);
  
      return {
        requiredSets,
        extraCharacters,
        pool
      };
    }
  
    function validateOptions(options, selection) {
      const invalidCharacterTypeFields = [
        elements.includeUppercase,
        elements.includeLowercase,
        elements.includeNumbers,
        elements.includeSymbols
      ];
  
      const hasCharacterType =
        options.includeUppercase ||
        options.includeLowercase ||
        options.includeNumbers ||
        options.includeSymbols;
  
      if (!hasCharacterType) {
        return {
          message: "Select at least one character type before generating a password.",
          invalidFields: invalidCharacterTypeFields,
          focusElement: elements.includeUppercase
        };
      }
  
      if (!selection.pool) {
        return {
          message: "Your current settings do not produce any valid characters. Add more options or remove exclusions.",
          invalidFields: [elements.extraCharacters],
          focusElement: elements.extraCharacters
        };
      }
  
      if (options.length < selection.requiredSets.length) {
        return {
          message: `Increase the password length to at least ${selection.requiredSets.length} to include each selected character type.`,
          invalidFields: [elements.passwordLength],
          focusElement: elements.passwordLength
        };
      }
  
      return null;
    }
  
    function clearFieldValidation() {
      [
        elements.passwordLength,
        elements.includeUppercase,
        elements.includeLowercase,
        elements.includeNumbers,
        elements.includeSymbols,
        elements.extraCharacters
      ].forEach((field) => field.removeAttribute("aria-invalid"));
    }
  
    function clearValidationMessage() {
      clearFieldValidation();
      elements.validationMessage.textContent = "";
    }
  
    function showValidationMessage(details) {
      clearFieldValidation();
  
      details.invalidFields.forEach((field) => {
        field.setAttribute("aria-invalid", "true");
      });
  
      elements.validationMessage.textContent = details.message;
  
      if (details.focusElement) {
        details.focusElement.focus();
      }
    }
  
    function clearStatusMessage() {
      if (state.statusTimer) {
        window.clearTimeout(state.statusTimer);
        state.statusTimer = null;
      }
  
      elements.statusMessage.textContent = "";
    }
  
    function showStatusMessage(message) {
      clearStatusMessage();
      elements.statusMessage.textContent = message;
  
      state.statusTimer = window.setTimeout(() => {
        elements.statusMessage.textContent = "";
      }, 2400);
    }
  
    function getRandomInt(max) {
      if (max <= 0) {
        return 0;
      }
  
      if (window.crypto && typeof window.crypto.getRandomValues === "function") {
        const randomValues = new Uint32Array(1);
        const maxUint32 = 0x100000000;
        const limit = Math.floor(maxUint32 / max) * max;
        let randomNumber;
  
        do {
          window.crypto.getRandomValues(randomValues);
          randomNumber = randomValues[0];
        } while (randomNumber >= limit);
  
        return randomNumber % max;
      }
  
      return Math.floor(Math.random() * max);
    }
  
    function pickRandomCharacter(characters) {
      return characters.charAt(getRandomInt(characters.length));
    }
  
    function shuffleCharacters(characters) {
      const shuffled = [...characters];
  
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = getRandomInt(index + 1);
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
      }
  
      return shuffled;
    }
  
    function generatePassword(options, selection) {
      const passwordCharacters = selection.requiredSets.map((set) => pickRandomCharacter(set));
  
      while (passwordCharacters.length < options.length) {
        passwordCharacters.push(pickRandomCharacter(selection.pool));
      }
  
      return shuffleCharacters(passwordCharacters).join("");
    }
  
    function getSelectedTypeCount(options) {
      return [
        options.includeUppercase,
        options.includeLowercase,
        options.includeNumbers,
        options.includeSymbols
      ].filter(Boolean).length;
    }
  
    function estimateStrength(options) {
      const selectedTypeCount = getSelectedTypeCount(options);
      const hasExtraCharacters = normalizeExtraCharacters(options.extraCharacters).length > 0;
  
      if (selectedTypeCount === 0) {
        return {
          label: "Unavailable",
          description: "Select at least one character type to estimate strength.",
          width: "0%",
          tone: "empty"
        };
      }
  
      let score = 0;
  
      if (options.length >= 10) score += 1;
      if (options.length >= 14) score += 1;
      if (selectedTypeCount >= 3 || (selectedTypeCount >= 2 && hasExtraCharacters)) score += 1;
      if ((selectedTypeCount >= 4 || (selectedTypeCount >= 3 && hasExtraCharacters)) && options.length >= 16) {
        score += 1;
      }
  
      const levels = [
        {
          label: "Very weak",
          description: "Estimated strength: very weak. Increase the length or add more character variety.",
          width: "20%",
          tone: "very-weak"
        },
        {
          label: "Fair",
          description: "Estimated strength: fair. A longer password or more character types would improve it.",
          width: "40%",
          tone: "fair"
        },
        {
          label: "Good",
          description: "Estimated strength: good. This is a solid baseline for many uses.",
          width: "60%",
          tone: "good"
        },
        {
          label: "Strong",
          description: "Estimated strength: strong. Good length and character variety are selected.",
          width: "80%",
          tone: "strong"
        },
        {
          label: "Very strong",
          description: "Estimated strength: very strong. Length and character variety are both high.",
          width: "100%",
          tone: "very-strong"
        }
      ];
  
      return levels[Math.min(score, levels.length - 1)];
    }
  
    function updateStrengthUI() {
      const options = getOptions();
      const strength = estimateStrength(options);
  
      elements.strengthMeterFill.style.width = strength.width;
      elements.strengthMeterFill.dataset.strength = strength.tone;
      elements.strengthText.textContent = strength.description;
    }
  
    function selectPasswordOutput() {
      if (!elements.passwordOutput.value) {
        return;
      }
  
      elements.passwordOutput.focus();
      elements.passwordOutput.select();
      elements.passwordOutput.setSelectionRange(0, elements.passwordOutput.value.length);
    }
  
    function fallbackCopy() {
      try {
        selectPasswordOutput();
        return document.execCommand("copy");
      } catch {
        return false;
      }
    }
  
    async function copyPassword() {
      const password = elements.passwordOutput.value;
  
      clearValidationMessage();
  
      if (!password) {
        showValidationMessage({
          message: "Generate a password before copying it.",
          invalidFields: [],
          focusElement: elements.generateButton
        });
        return;
      }
  
      let copied = false;
  
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(password);
          copied = true;
        } else {
          copied = fallbackCopy();
        }
      } catch {
        copied = fallbackCopy();
      }
  
      if (copied) {
        const originalLabel = "Copy Password";
  
        showStatusMessage("Password copied to your clipboard.");
        elements.copyButton.textContent = "Copied!";
        elements.copyButton.disabled = true;
  
        if (state.copyButtonTimer) {
          window.clearTimeout(state.copyButtonTimer);
        }
  
        state.copyButtonTimer = window.setTimeout(() => {
          elements.copyButton.textContent = originalLabel;
          elements.copyButton.disabled = false;
        }, 1600);
  
        return;
      }
  
      selectPasswordOutput();
      showStatusMessage("Copy failed. The password has been selected so you can copy it manually.");
    }
  
    function handleGenerate(event) {
      if (event) {
        event.preventDefault();
      }
  
      clearValidationMessage();
  
      const options = getOptions();
      const selection = getSelectedSets(options);
      const validation = validateOptions(options, selection);
  
      if (validation) {
        showValidationMessage(validation);
        updateStrengthUI();
        return;
      }
  
      const password = generatePassword(options, selection);
      elements.passwordOutput.value = password;
      showStatusMessage("New password generated locally in your browser.");
      updateStrengthUI();
    }
  
    function init() {
      applyTheme(getInitialTheme());
      subscribeToSystemThemeChanges();
      updateLengthValue();
      updateStrengthUI();
      handleGenerate();
  
      elements.themeToggle.addEventListener("click", handleThemeToggle);
      elements.form.addEventListener("submit", handleGenerate);
      elements.copyButton.addEventListener("click", copyPassword);
      elements.passwordLength.addEventListener("input", () => {
        updateLengthValue();
        clearValidationMessage();
        updateStrengthUI();
      });
  
      [
        elements.includeUppercase,
        elements.includeLowercase,
        elements.includeNumbers,
        elements.includeSymbols,
        elements.excludeSimilar
      ].forEach((input) => {
        input.addEventListener("change", () => {
          clearValidationMessage();
          updateStrengthUI();
        });
      });
  
      elements.extraCharacters.addEventListener("input", () => {
        clearValidationMessage();
        updateStrengthUI();
      });
  
      elements.passwordOutput.addEventListener("focus", selectPasswordOutput);
      elements.passwordOutput.addEventListener("click", selectPasswordOutput);
    }
  
    init();
  })();
  