// BUDGET CONTROLLER
var budgetController = (function() {
  // construcutes
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totaincome) {
    if (totaincome > 0) {
      this.percentage = Math.round(this.value / totaincome + 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
    /*
        0
        [200, 400, 100]
        sum = 0 + 200
        sum = 200 + 400
        sum = 600 + 100 = 700 
        */
  };

  // data structures
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  // allow other mods to add items into our data structure

  return {
    addItem: function(type, des, val) {
      var newItem;

      // create new ID

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // create new item based on inc or ex type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      // push into data struture
      data.allItems[type].push(newItem);

      // return new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      // id = 3
      // data.allItems[type][id] wont work becuse ids or not in order

      var ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // calculet total income and expense
      calculateTotal("exp");
      calculateTotal("inc");

      // calc budget : income - expensee
      data.budget = data.totals.inc - data.totals.exp;

      // calc % of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round(data.totals.exp / data.totals.inc) * 100;
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      /*
      a -20
      b-40
      c-40
      totaincome - 100
      */
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage();
      });
    },
    getPercentage: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage(data.totals.inc);
      });
      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExpense: data.totals.exp,
        percentages: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };
})();

// UI CONTROLLER
var UIController = (function() {
  // central place to store strings and retirve/ easy to change in future
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLable: ".budget__value",
    incomeLable: ".budget__income--value",
    expenseLable: ".budget__expenses--value",
    percentageLable: ".budget__expenses--percentage",
    container: ".container",
    expensePercentageLAble: ".item__percentage",
    dataLable: ".budget__title--month"
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec;
    /*
    + or - befoe number
    exatry 2 decimal points
     comma seperating the thousends 

     2310.232 -> 2,310.23
    */

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        //method for returning all 3 inputs we have in the UI
        type: document.querySelector(DOMstrings.inputType).value,
        // will be either income or expense
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;
      // create html string with placeholder text

      if (type === "inc") {
        element = DOMstrings.incomeContainer;

        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="far fa-trash-alt"></i></button> </div> </div> </div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="far fa-trash-alt"></i></button> </div> </div> </div>';
      }

      // replace place holder text with data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // insert html into the dom
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArr;
      // retursn list, so convert list into array using slice
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMstrings.budgetLable).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLable).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expenseLable
      ).textContent = formatNumber(obj.totalExpense, "exp");

      if (obj.percentages > 0) {
        document.querySelector(DOMstrings.percentageLable).textContent =
          obj.percentages + "%";
      } else {
        document.querySelector(DOMstrings.percentageLable).textContent = "---";
      }
    },
    changedType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );
    },

    displayPercentages: function(percentage) {
      var fields = document.querySelectorAll(DOMstrings.expensePercentageLAble);

      /*
        when we call the node list for each function we pass a call back
        function into it.
        the function is asigned to the callback peramiter
        we then loop over the list and with each iteration the call back functin
        gets called


      */
      nodeListForEach(fields, function(current, index) {
        if (percentage[index] > 0) {
          current.textContent - percentage[index] + "%";
        } else {
          customElements.textContent = "---";
        }
      });
    },

    displayMonth: function() {
      var now, year, month, months;
      var now = new Date();

      months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "June",
        "July",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];

      month = now.getMonth();

      year = now.getFullYear();
      document.querySelector(DOMstrings.dataLable).textContent =
        months[month] + " " + year;
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType,
        +"," + DOMstrings.inputDescription + "," + DOMstrings.inputValue
      );

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle("red-focus");
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },

    // exposing dom object
    getDomStrings: function() {
      return DOMstrings;
    }
  };
})();

// GLOBAL APP CONTROLLER
var AppController = (function(budgetController, UIController) {
  var setUpEventListners = function() {
    var DOM = UIController.getDomStrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        // which is for older browsers
        ctrAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeletItem);
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UIController.changedType);
  };

  var updateBudget = function() {
    // 1. calculate budget
    budgetController.calculateBudget();

    // 2. return budget
    var budget = budgetController.getBudget();

    // 3. display budget on UI
    UIController.displayBudget(budget);
  };

  var updatePercentges = function() {
    // 1. clac %
    budgetController.calcPercentage();

    // 2. read %
    var percentage = decodeURI.getPercentage();

    // 3. update the UI with the new %
    UIController.displayPercentages(percentage);
  };

  var ctrAddItem = function() {
    var input, newItem;
    // 1. get the field input data
    input = UIController.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. add item to budget controller
      newItem = budgetController.addItem(
        input.type,
        input.description,
        input.value
      );

      // 3. add the new item to user interface
      UIController.addListItem(newItem, input.type);

      // 4. clear fiels
      UIController.clearFields();

      //5. calc update budget
      updateBudget();
    }
  };

  var ctrlDeletItem = function(event) {
    var itemId, splitID, type, ID;

    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      //inc-1
      splitID = itemId.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete the item for data str
      budgetController.deleteItem(type, ID);

      // 2. delete item fron the UI
      UIController.deleteListItem(itemId);

      // 3. update and show new budget
      updateBudget();
    }
  };

  return {
    init: function() {
      UIController.displayMonth();
      UIController.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExpense: 0,
        percentages: -1
      });
      setUpEventListners();
    }
  };
})(budgetController, UIController);

AppController.init();
