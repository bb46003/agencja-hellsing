export function registerHandlebarsHelpers() {
  Handlebars.registerHelper("array", function (...args) {
    args.pop(); // remove last argument (Handlebars options object)
    return args;
  });

  Handlebars.registerHelper("ifEquals", function (a, b, options) {
    if (a === b) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  Handlebars.registerHelper("capital", function (str) {
    if (typeof str !== "string") return "";
    return str.toUpperCase();
  });
  Handlebars.registerHelper("range", function (start, end) {
    let result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  });
  Handlebars.registerHelper("log", function (element) {
    console.log(element);
  });
  Handlebars.registerHelper("notEmpty", function (arr) {
    return (Array.isArray(arr) || typeof arr === "string") && arr.length > 0;
  });

  Handlebars.registerHelper("isArray", function (value) {
    return Array.isArray(value);
  });

  Handlebars.registerHelper("join", function (arr, separator) {
    if (!Array.isArray(arr)) return "";
    return arr.join(separator);
  });
  Handlebars.registerHelper({
    eq: (v1, v2) => v1 === v2,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and() {
      return Array.prototype.every.call(arguments, Boolean);
    },
    or() {
      return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    },
  });
  Handlebars.registerHelper("isLekkie", function (key) {
    if (key.includes("lekka")) {
      return true;
    } else {
      return false;
    }
  });
  Handlebars.registerHelper("kosztAkcji", function (efekt){
    const typKosztu = efekt.typkosztu;
    const koszt = efekt.koszt;
    let html = '<div class="koszt-label">'
    if(koszt.P !== ""){
      html += `<label class="koszt">P:${koszt.P}</label>`
    }
     if(koszt.S !== ""){
      html += `<label class="koszt">S:${koszt.S}</label>`
    }
     if(koszt.M !== ""){
      html += `<label class="koszt">M:${koszt.M}</label>`
    }
    html += '</div>'
    return html
  })
  Handlebars.registerHelper("bothNotEmpty", function(a, b, options) {
  if (Array.isArray(a) && a.length > 0 && Array.isArray(b) && b.length > 0) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});
}
