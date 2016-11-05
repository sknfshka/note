document.addEventListener('DOMContentLoaded', function() {
    recodsList = document.getElementById('recordsList');
    document.getElementById('submitEnter').addEventListener('click', handleForm);
    /*Обработчик отправки заметки*/
    function handleForm(event) {
        event.preventDefault();

        var text = document.getElementById("textEnter");

        var tags = [];

        var textContent = text.textContent.match(/#[А-Яа-я0-9ё\w]+/g);

        if (textContent !== null)
        {
            textContent.forEach(function (element, index) {
                var isSame = false;
                tags.forEach(function (elem) {
                    if(element == elem.text)
                        isSame = true;
                });
                if(isSame == false)
                    tags.push({ "text" : element, "id" : index });
            });
        }

        var note = { "id" : storedNotes.length == undefined ? 0 : storedNotes.length, "text" : text.textContent, "tags" : tags};
        storedNotes.push(note);
        localStorage.setItem("notes", JSON.stringify(storedNotes));
        addNewRecord(note);

        text.innerHTML = null;
    }
    /*Начальная загрузка заметок*/
    var storedNotes = JSON.parse(localStorage.getItem("notes"));
    if(storedNotes == null)
        storedNotes = [];
    storedNotes.forEach(function(value, index){
        addNewRecord(storedNotes[index]);
    });
    /*Обработчики для фильтра*/
    var filter = document.getElementById("filterEnter");
    filter.addEventListener('focus', function () {
        if (this.textContent == 'Enter tag through gap')
            this.textContent = '';
    });
    filter.addEventListener('blur', function () {
        if (this.textContent == '')
            this.textContent = 'Enter tag through gap';
    });
    document.getElementById('submitFilter').addEventListener('click', function () {
        var filter = document.getElementById("filterEnter");
        var tags = filter.textContent.match(/#[А-Яа-я0-9ё\w]+/g);

        if (tags != null)
        {
            storedNotes.forEach(function(element) {
                var makeNotActive = false;
                for(let i = 0; i < tags.length; i++)
                {
                    var findSame = false;
                    for(let j = 0; j < element.tags.length; j++)
                    {
                        if(tags[i] == element.tags[j].text)
                        {
                            findSame = true;
                            break;
                        }
                    }
                    if(findSame == false)
                    {
                        makeNotActive = true;
                        break;
                    }
                }
                var note = document.getElementById('note-' + element.id);
                if(makeNotActive == true)
                    note.classList.add('notActive');
                else
                    note.classList.remove('notActive');
            });
        }
        else
        {
            var notes = document.getElementsByClassName('note');
            if (notes !== null)
            {
                for (let i = 0; i < notes.length; i++)
                    if(filter.textContent == 'Enter tag through gap')
                        notes[i].classList.remove('notActive');
                    else
                        notes[i].classList.add('notActive');
            }
        }
    });
    /*Обработка ввода текста при добавлении новой заметки*/
    var input = document.getElementById('textEnter');
    input.addEventListener('keyup', function () {
        var text = this.textContent;
        var highlighted = text.replace(/(#[А-Яа-я0-9ё\w]+)/g, '<span class="hashtag">$1</span>');
        this.innerHTML = highlighted;
        placeCaretAtEnd(this);
    });
    /*Перемещение указателя внутри блока contentEditable*/
    function placeCaretAtEnd(el) {
        el.focus();
        if (typeof window.getSelection != "undefined" &&
            typeof document.createRange != "undefined"
        ) {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }
    /*Развешивание слушателей на события клик, для удаления*/
    var deleteItems = document.getElementsByClassName('del');
    if (deleteItems !== null)
    {
        for (let i = 0; i < deleteItems.length; i++) {
            deleteItems[i].addEventListener('click', removeHandle);
        }
    }
    /*Обработчик удаления заметки*/
    function removeHandle (event) {
        var target = event.target;
        var parent = target.parentNode;
        storedNotes.splice(searchRealIndex(parent.dataset.id, storedNotes), 1);
        localStorage.setItem("notes", JSON.stringify(storedNotes));
        parent.remove();
    }
    /*Обработчик изменения заметки*/
    function editHandle(event) {
        var target = event.target;
        var parent = target.parentNode;
        var par = parent.getElementsByClassName('noteText')[0];
        var ulTags = parent.getElementsByClassName('tagList')[0];

        if(par.getAttribute("contentEditable") == 'true')
        {
            target.classList.remove('act');
            par.classList.remove('underline');
            par.setAttribute("contentEditable", false);

            var text = par.textContent;
            var highlighted = text.replace(/<span class="hashtag">(#[А-Яа-я0-9ё\w]+)<\/span>/g, '$1');
            par.innerHTML = highlighted;

            var noteRealId = searchRealIndex(parent.dataset.id, storedNotes)
            storedNotes[noteRealId].text = par.innerText;

            var tagsContent = par.textContent.match(/#[А-Яа-я0-9ё\w]+/g);
            if (tagsContent !== null)
            {
                tagsContent.forEach(function (element)
                {
                    var isSame = false;
                    storedNotes[noteRealId].tags.forEach(function (elem) {
                    if(element == elem.text)
                        isSame = true;
                    });
                    if(isSame == false)
                    {
                        storedNotes[noteRealId].tags.push({ "text" : element, "id" : storedNotes[noteRealId].tags.length });
                        addTagToListt(ulTags, noteRealId, {"text":element, "id":storedNotes[noteRealId].tags.length - 1});
                    }

                });
             }

             localStorage.setItem("notes", JSON.stringify(storedNotes));
        }
        else
        {
            target.classList.add('act');
            par.classList.add('underline');
            par.setAttribute("contentEditable", true);

            var text = par.textContent;
            var highlighted = text.replace(/(#[А-Яа-я0-9ё\w]+)/g, '<span class="hashtag">$1</span>');
            par.innerHTML = highlighted;
        }
    }
    /*Обработчик ввода при редактировании*/
    function pEditHandle() {
        var text = this.textContent;
        var highlighted = text.replace(/(#[А-Яа-я0-9ё\w]+)/g, '<span class="hashtag">$1</span>');
        this.innerHTML = highlighted;
        placeCaretAtEnd(this);
    }
    /*Поиск в массиве array по значения array.id*/
    function  searchRealIndex(id, array) {
        if(array == undefined || array == null || id == undefined)
            return;
        for(let i = 0; i < array.length; i++)
        {
            if(array[i].id == id)
                return i;
        }

        return null;
    }
    /*Добавление новой записи(элементов DOM дерева)*/
    function addNewRecord(object){
        var li = document.createElement('li');
        li.setAttribute('id', 'note-' + object.id);
        li.classList.add('note');
        recodsList.appendChild(li);
        li.dataset.id = object.id;

        var p = document.createElement('p');
        p.classList.add('noteText');
        p.innerHTML = object.text;
        p.addEventListener('keyup', pEditHandle)
        li.appendChild(p);

        var del = document.createElement('a');
        del.innerHTML = 'X';
        del.classList.add('del');
        li.appendChild(del);
        del.addEventListener('click', removeHandle);

        var edit = document.createElement('a');
        edit.innerHTML = 'E';
        edit.classList.add('edit');
        li.appendChild(edit);
        edit.addEventListener('click', editHandle);

        var span = document.createElement('span');
        span.classList.add('smbl');
        span.innerHTML = '#';
        li.appendChild(span);

        var newTagTextField = document.createElement('div');
        newTagTextField.classList.add('newTagText');
        newTagTextField.setAttribute('contentEditable',true);
        li.appendChild(newTagTextField);

        var addNewTag = document.createElement('a');
        addNewTag.classList.add('addNewTag');
        addNewTag.innerHTML = '+';
        addNewTag.addEventListener('click', function (event) {
            var parent = event.target.parentNode;
            var ulTags = parent.getElementsByClassName('tagList')[0];
            var noteRealId = searchRealIndex(parent.dataset.id, storedNotes);
            var newTagText = parent.getElementsByClassName('newTagText')[0];
            var text = '#' + newTagText.textContent;

            if (text !== null)
            {
                var isSame = false;
                storedNotes[noteRealId].tags.forEach(function (elem) {
                    if(text == elem.text)
                        isSame = true;
                });
                if(isSame == false)
                {
                    storedNotes[noteRealId].tags.push({ "text" : text, "id" : storedNotes[noteRealId].tags.length });
                    addTagToListt(ulTags, noteRealId, {"text":text, "id": storedNotes[noteRealId].tags.length - 1});

                    localStorage.setItem("notes", JSON.stringify(storedNotes));
                }
            }

            newTagText.textContent = null;
        });
        li.appendChild(addNewTag);

        var ul = document.createElement('ul');
        ul.classList.add('tagList');
        li.appendChild(ul);

        if (object.tags !== null && object.tags.length !== 0)
        {
            object.tags.forEach(function(value, index) {
                addTagToListt(ul, object.id, value);
            });
        }
    }
    /*Добавление тега в список тегов записки*/
    function addTagToListt(ul, noteId, value) {
        var innerLi = document.createElement('li');
        innerLi.setAttribute('id', 'tag-' + value.id);
        innerLi.classList.add('tag');
        innerLi.innerHTML = value.text;
        innerLi.dataset.id = value.id;
        innerLi.dataset.note = noteId;

        var del = document.createElement('a');
        del.classList.add('delTag');
        del.innerHTML = 'x';
        del.addEventListener('click', function (event) {
            var target = event.target;
            var parent = target.parentNode;

            var noteIndex = searchRealIndex(parent.dataset.note, storedNotes)
            var i = searchRealIndex(Number(parent.dataset.id), storedNotes[noteIndex].tags)
            var tagText = storedNotes[noteIndex].tags[i].text;
            storedNotes[noteIndex].tags.splice(i, 1);
            var reg = new RegExp(tagText, 'g');

            var newNoteText = storedNotes[noteIndex].text.replace(reg, tagText.substr(1));
            storedNotes[noteIndex].text = newNoteText;

            var editNote = document.getElementById('note-' + parent.dataset.note).getElementsByTagName('p')[0];
            editNote.innerText = editNote.innerText.replace(reg, tagText.substr(1));
            localStorage.setItem("notes", JSON.stringify(storedNotes));
            parent.remove();
        });
        innerLi.appendChild(del);

        ul.appendChild(innerLi);
    }
});

