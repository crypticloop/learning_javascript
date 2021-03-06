/*
This file has 3 modules:

* budgetController manipulates the budget and the data objects
* UIController manipulates the UI
* controller co-ordinates the behaviour of the methods combined inside the two modules above with the inputs of the user

*/


let budgetController = (function() {

  let Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }

  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  let Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let calculateTotal = function(type) {
    let sum = 0;

    data.allItems[type].forEach(function(current) {
      sum += current.value;
    });

    data.totals[type] = sum;
  };

  let data = {
    allItems: {
      expense: [],
      income: []
    },
    totals: {
      expense: 0,
      income: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      let newItem, ID;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length-1].id + 1
      }
      else {
        ID = 0;
      }

      if (type === 'expense') {
        newItem = new Expense(ID, des, val);
      }
      else if (type === 'income') {
        newItem = new Income(ID, des, val);
      }

      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function(type, id) {
      let ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index  !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      calculateTotal('expense');
      calculateTotal('income');

      data.budget = data.totals.income - data.totals.expense;

      if (data.totals.income > 0) {
        data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
      } else {
        data.percentage = -1;
      }

    },

    calculatePercentages: function() {

      data.allItems.expense.forEach(function(current) {
        current.calcPercentage(data.totals.income);
      });
    },

    getPercentages: function() {
      let allPercentages = data.allItems.expense.map(function(current) {
        return current.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.income,
        totalExpense: data.totals.expense,
        percentage: data.percentage

      }
    },


    testing: function() {
      console.log(data);
    }
  };


})();

let UIController = (function() {

  let formatNumber = function(number, type) {

    let numberSplit, integerPart, decimalPart, sign;

    number = Math.abs(number);
    number = number.toFixed(2);

    numberSplit = number.split('.');
    integerPart = numberSplit[0];

    if (integerPart.length > 3) {
      integerPart = integerPart.substr(0, integerPart.length - 3) + ',' +  integerPart.substr(integerPart.length - 3,3);
    }
    decimalPart = numberSplit[1];

    return (type === 'expense' ? '-': '+') + ' '  + integerPart + '.' + decimalPart;

  };

  let nodeListForEach = function(list, callback) {
    for (let i = 0; i  < list.length; i++) {
      callback(list[i], i);
    }
  };

  let DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensePercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  }

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // Will be inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      let html, newHtml, element;

      if (type === 'income') {

        element = DOMstrings.incomeContainer;

        html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

      } else if (type === 'expense') {

        element = DOMstrings.expenseContainer;

        html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div';

      }

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    deleteListItem: function(selectorID) {
      let element  = document.getElementById(selectorID)

      element.parentNode.removeChild(element);
    },

    clearFields: function() {
      let fields, fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription + `, ` + DOMstrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {

      let type;
      obj.budget >= 0 ? type = 'income' : type = 'expense';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, "income");
      document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExpense, "expense");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function(percentages) {

      let fields = document.querySelectorAll(DOMstrings.expensePercentageLabel);

      nodeListForEach(fields, function(current, index) {

        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        }
        else {
          current.textContent = '---';
        }

      });

    },

    displayMonth: function() {
      let now, year, month,  monthsArray;
      now = new Date();

      monthsArray = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

      year = now.getFullYear();
      month = now.getMonth();

      document.querySelector(DOMstrings.dateLabel).textContent = monthsArray[month] + ' (' + year + ')';
    },

    changedType: function() {

      let fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue);

      nodeListForEach(fields, function(currentElement) {

        currentElement.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');


      },

    getDOMstrings: function() {
      return DOMstrings;
    }
  }

})();

let controller = (function(budgetCtrl, UICtrl) {

  let setupEventListeners = function() {

    let DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if(event.keyCode == 13 || event.which == 13)  {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

  }

  let updatePercentages = function() {

    budgetCtrl.calculatePercentages();
    // Calculate percentages

    let percentages = budgetCtrl.getPercentages();
    //Read percentages

    // Update the UI
    UICtrl.displayPercentages(percentages);
  }

  let updateBudget = function() {

    // Calculate the budget
    budgetCtrl.calculateBudget();

    // Return the budget
    let budget = budgetCtrl.getBudget();

    // Display the budget in the UI
    UICtrl.displayBudget(budget);


  }

  let ctrlAddItem = function() {

    let input, newItem;

    input = UICtrl.getInput();


    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      console.log(input);

      newItem = budgetCtrl.addItem(input.type, input.description, input.value)

      UICtrl.addListItem(newItem, input.type);

      UICtrl.clearFields();

      updateBudget();
      updatePercentages();
    }

  };

  let ctrlDeleteItem = function(event) {
    let itemID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {

      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      budgetCtrl.deleteItem(type, ID);

      UICtrl.deleteListItem(itemID);

      updateBudget();
      updatePercentages();

    }
  }

  return {
    init: function() {
      console.log("Application has started");
      setupEventListeners();
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpense: 0,
        percentage: -1
      });
      UICtrl. displayMonth();
    }
  }

})(budgetController, UIController);

controller.init();
