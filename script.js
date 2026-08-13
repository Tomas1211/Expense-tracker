const addExpenseForm = document.getElementById("addExpenseForm")
const expenseName = document.getElementById("expenseName")
const expensePrice = document.getElementById("expensePrice")
const expenseCategory = document.getElementById("expenseCategory")
const expensesList = document.getElementById("expensesList")
const totalExpense = document.getElementById("totalExpense")
const categoryFilter = document.getElementById("categoryFilter")
const submitBtn = document.getElementById("submitBtn")
const nameErrorMessage = document.getElementById("nameErrorMessage")
const priceErrorMessage = document.getElementById("priceErrorMessage")
const categoryErrorMessage = document.getElementById("categoryErrorMessage")


const state = {
    expenses: [],
    editedExpenseId: null,
    selectedCategory: "all",
    cancelEditingBtn: null
}

const categoryNames = {
    food: "jedlo",
    transport: "doprava",
    housing: "bývanie",
    fun: "zábava",
    other: "iné"
}


// =========================
// VALIDÁCIA
// =========================

const setInputError = (element, isValid) => {
    if (!isValid) {
        element.classList.add("input-error")
    } else {
        element.classList.remove("input-error")
    }
}


const formValidation = () => {
    const name = expenseName.value
    const priceValue = expensePrice.value
    const category = expenseCategory.value

    nameErrorMessage.textContent = ""
    priceErrorMessage.textContent = ""
    categoryErrorMessage.textContent = ""

    const nameIsValid = name.trim() !== ""

    const priceIsValid =
        priceValue.trim() !== "" &&
        !isNaN(Number(priceValue)) &&
        Number(priceValue) > 0

    const categoryIsValid = category !== ""


    if (!nameIsValid) {
        nameErrorMessage.textContent =
            "Názov položky nesmie byť prázdny"
    }

    setInputError(expenseName, nameIsValid)


    if (priceValue.trim() === "") {
        priceErrorMessage.textContent = "Zadajte cenu"
    } else if (isNaN(Number(priceValue))) {
        priceErrorMessage.textContent =
            "Cena výdavku musí byť číselná hodnota"
    } else if (Number(priceValue) <= 0) {
        priceErrorMessage.textContent =
            "Cena výdavku musí byť väčšia ako 0"
    }

    setInputError(expensePrice, priceIsValid)


    if (!categoryIsValid) {
        categoryErrorMessage.textContent = "Zvoľte kategóriu"
    }

    setInputError(expenseCategory, categoryIsValid)


    return nameIsValid && priceIsValid && categoryIsValid
}


// =========================
// LOCAL STORAGE
// =========================

const saveExpenses = () => {
    localStorage.setItem("expenses", JSON.stringify(state.expenses))
}


const loadExpenses = () => {
    state.expenses =
        JSON.parse(localStorage.getItem("expenses")) || []

    renderExpenses()
}


// =========================
// VYKRESĽOVANIE
// =========================

const updateTotal = (expenses) => {
    const total = getTotalExpenses(expenses)

    totalExpense.textContent = `${total} €`
}


const renderExpenses = () => {
    expensesList.innerHTML = ""

    const filtered = state.expenses.filter(expense =>
        state.selectedCategory === "all" ||
        expense.category === state.selectedCategory
    )


    filtered.forEach(expense => {
        const li = document.createElement("li")

        li.textContent =
            `${capitalize(expense.name)} - ${expense.price} € - ${capitalize(categoryNames[expense.category])}`


        const editBtn = document.createElement("button")
        editBtn.textContent = "✏️"


        const deleteBtn = document.createElement("button")
        deleteBtn.textContent = "❌"


        editBtn.addEventListener(
            "click",
            () => startEditingExpense(expense.id)
        )

        deleteBtn.addEventListener(
            "click",
            () => deleteExpense(expense.id)
        )


        li.appendChild(editBtn)
        li.appendChild(deleteBtn)
        expensesList.appendChild(li)
    })


    updateTotal(filtered)
}


// =========================
// PRIDANIE / MAZANIE
// =========================

const addExpense = () => {
    const id = Date.now()
    const name = expenseName.value
    const price = Number(expensePrice.value)
    const category = expenseCategory.value

    const expense = {
        id,
        name,
        price,
        category
    }


    if (formValidation()) {
        state.expenses.push(expense)

        saveAndRender()

        addExpenseForm.reset()
    }
}


const deleteExpense = (id) => {
    state.expenses =
        state.expenses.filter(expense => expense.id !== id)

    saveAndRender()
}


// =========================
// EDITOVANIE
// =========================

const updateSubmitButton = () => {
    if (state.editedExpenseId === null) {
        submitBtn.textContent = "+ Pridať položku"
    } else {
        submitBtn.textContent = "💾 Uložiť zmeny"
    }
}


const createCancelButton = () => {
    if (state.cancelEditingBtn !== null) {
        return
    }


    if (state.editedExpenseId !== null) {
        state.cancelEditingBtn =
            document.createElement("button")

        state.cancelEditingBtn.textContent = "❌ Zrušiť"

        addExpenseForm.appendChild(state.cancelEditingBtn)


        state.cancelEditingBtn.addEventListener("click", () => {
            state.editedExpenseId = null

            addExpenseForm.reset()

            updateSubmitButton()

            nameErrorMessage.textContent = ""
            priceErrorMessage.textContent = ""
            categoryErrorMessage.textContent = ""

            setInputError(expenseName, true)
            setInputError(expensePrice, true)
            setInputError(expenseCategory, true)

            state.cancelEditingBtn.remove()
            state.cancelEditingBtn = null
        })
    }
}


const startEditingExpense = (id) => {
    state.editedExpenseId = id


    const editedExpense = getExpenseById(id)


    expenseName.value = editedExpense.name
    expensePrice.value = editedExpense.price
    expenseCategory.value = editedExpense.category


    updateSubmitButton()
    createCancelButton()
}


const saveEditedExpense = (id) => {
    const editedExpense = getExpenseById(id)


    if (!editedExpense) return


    if (formValidation()) {
        editedExpense.name = expenseName.value
        editedExpense.price = Number(expensePrice.value)
        editedExpense.category = expenseCategory.value


        state.editedExpenseId = null

        saveAndRender()

        updateSubmitButton()

        state.cancelEditingBtn.remove()
        state.cancelEditingBtn = null

        addExpenseForm.reset()
    }
}





// =========================
// POMOCNÉ FUNKCIE
// =========================
const getExpenseById = (id) => state.expenses.find(expense => expense.id === id)

const getExpensesByCategory = (category) => state.expenses.filter(expense => expense.category === category)

const getExpenseByName = (name) => state.expenses.find(expense => expense.name === name)

const getExpensesNames = () => state.expenses.map(expense => expense.name)

const getExpensePrices = () => state.expenses.map(expense => expense.price)

const getTotalExpenses = (expenses) => expenses.reduce((total, expense) => total + expense.price, 0)

const getTotalExpenseByCategory = (category) => {
    const filtered = state.expenses.filter(expense => expense.category === category)
    return getTotalExpenses(filtered)
}





const saveAndRender = () => {
    saveExpenses()
    renderExpenses()
}


const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1)
}


// =========================
// EVENT LISTENERS
// =========================

addExpenseForm.addEventListener("submit", (event) => {
    event.preventDefault()


    if (state.editedExpenseId !== null) {
        saveEditedExpense(state.editedExpenseId)
    } else {
        addExpense()
    }
})


categoryFilter.addEventListener("change", () => {
    state.selectedCategory = categoryFilter.value

    renderExpenses()
})


// =========================
// SPUSTENIE APLIKÁCIE
// =========================

updateSubmitButton()
loadExpenses()
