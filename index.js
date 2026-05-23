let goodsState = JSON.parse(localStorage.getItem('shopping_cart_state')) || [
    { id: 1, name: "Помідори", quantity: 2, isBought: true, isEditing: false },
    { id: 2, name: "Печиво", quantity: 2, isBought: false, isEditing: false },
    { id: 3, name: "Сир", quantity: 1, isBought: false, isEditing: false }
];
const goodsList = document.querySelector('.goods-list');
const addItemForm = document.querySelector('.add-item-form');
const inputGoods = document.querySelector('.input-goods');
const sidebar = document.querySelector('.sidebar');

function saveToLocalStorage() {
    localStorage.setItem('shopping_cart_state', JSON.stringify(goodsState));
}

function render() {
    if (!goodsList) return;
    goodsList.innerHTML = '';
    goodsState.forEach(item => {
        const li = document.createElement('li');
        li.className = `goods-item ${item.isBought ? 'item-bought' : ''}`;
        const nameWrapper = document.createElement('div');
        nameWrapper.className = 'goods-name-wrapper';

        if (item.isEditing && !item.isBought) {
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = item.name;
            nameInput.className = 'input-edit';
            setTimeout(() => {
                nameInput.focus();
                nameInput.select();
            }, 50);
            nameInput.addEventListener('blur', () => {
                const newName = nameInput.value.trim();
                if (newName) item.name = newName;
                item.isEditing = false;
                render();
            });
            nameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') nameInput.blur();
            });
            nameWrapper.appendChild(nameInput);
        } else {
            const nameSpan = document.createElement('span');
            nameSpan.className = 'goods-name';
            nameSpan.textContent = item.name;

            if (!item.isBought) {
                nameSpan.style.cursor = 'pointer';
                nameSpan.addEventListener('click', () => {
                    item.isEditing = true;
                    render();
                });
            }
            nameWrapper.appendChild(nameSpan);
        }
        li.appendChild(nameWrapper);

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'quantity-controls';

        if (!item.isBought) {
            const btnMinus = document.createElement('button');
            btnMinus.className = 'btn-count btn-minus';
            btnMinus.textContent = '−';
            btnMinus.setAttribute('data-tooltip', 'Зменшити кількість');
            if (item.quantity <= 1) btnMinus.disabled = true; 
            
            btnMinus.addEventListener('click', () => {
                if (item.quantity > 1) {
                    item.quantity--;
                    render();
                }
            });
            const qtySpan = document.createElement('span');
            qtySpan.className = 'quantity-value';
            qtySpan.textContent = item.quantity;

            const btnPlus = document.createElement('button');
            btnPlus.className = 'btn-count btn-plus';
            btnPlus.textContent = '+';
            btnPlus.setAttribute('data-tooltip', 'Збільшити кількість');
            
            btnPlus.addEventListener('click', () => {
                item.quantity++;
                render();
            });

            controlsDiv.appendChild(btnMinus);
            controlsDiv.appendChild(qtySpan);
            controlsDiv.appendChild(btnPlus);
        } else {
            const qtySpan = document.createElement('span');
            qtySpan.className = 'quantity-value';
            qtySpan.textContent = item.quantity;
            controlsDiv.appendChild(qtySpan);
        }
        li.appendChild(controlsDiv);
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'item-actions';

        const btnStatus = document.createElement('button');
        btnStatus.className = `btn-status ${item.isBought ? 'status-bought' : 'status-unbought'}`;
        btnStatus.textContent = item.isBought ? 'Куплено' : 'Не куплено';
        btnStatus.setAttribute('data-tooltip', item.isBought ? 'Зробити не купленим' : 'Позначити як куплене');
        
        btnStatus.addEventListener('click', () => {
            item.isBought = !item.isBought;
            item.isEditing = false;
            render();
        });
        actionsDiv.appendChild(btnStatus);

        if (!item.isBought) {
            const btnDelete = document.createElement('button');
            btnDelete.className = 'btn-delete';
            btnDelete.textContent = '×';
            btnDelete.setAttribute('data-tooltip', 'Видалити товар');
            
            btnDelete.addEventListener('click', () => {
                goodsState = goodsState.filter(g => g.id !== item.id);
                render();
            });
            actionsDiv.appendChild(btnDelete);
        }
        li.appendChild(actionsDiv);
        goodsList.appendChild(li);
    });
    renderSidebar();
    saveToLocalStorage(); 
}

function renderSidebar() {
    if (!sidebar) return;
    const oldBlocks = sidebar.querySelectorAll('.stats-block');
    oldBlocks.forEach(block => block.remove());

    const leftBlock = document.createElement('div');
    leftBlock.className = 'stats-block';
    leftBlock.innerHTML = '<h3>Залишилося</h3>';
    const leftTagsContainer = document.createElement('div');
    leftTagsContainer.className = 'tags-container';

    const boughtBlock = document.createElement('div');
    boughtBlock.className = 'stats-block';
    boughtBlock.innerHTML = '<h3>Куплено</h3>';
    const boughtTagsContainer = document.createElement('div');
    boughtTagsContainer.className = 'tags-container';

    const template = document.getElementById('tag-template');
    if (template) {
        goodsState.forEach(item => {
            const clone = template.content.cloneNode(true);
            const tagSpan = clone.querySelector('.tag');
            if (item.isBought) tagSpan.classList.add('tag-crossed');
			
            clone.querySelector('.tag-name').textContent = item.name + ' ';
            clone.querySelector('.tag-count').textContent = item.quantity;
            
            if (item.isBought) boughtTagsContainer.appendChild(clone);
			else leftTagsContainer.appendChild(clone);
        });
    }
    leftBlock.appendChild(leftTagsContainer);
    boughtBlock.appendChild(boughtTagsContainer);

    sidebar.appendChild(leftBlock);
    sidebar.appendChild(boughtBlock);
}

if (addItemForm) {
    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const goodsName = inputGoods.value.trim();
        if (!goodsName) return;

        goodsState.push({
            id: Date.now(),
            name: goodsName,
            quantity: 1,
            isBought: false,
            isEditing: false
        });
        inputGoods.value = '';
        inputGoods.focus();
        render();
    });
}
render();