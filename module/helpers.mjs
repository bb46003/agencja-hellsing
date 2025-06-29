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
}
