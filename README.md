# Demo
https://ui-dropdown.herokuapp.com/

# Done
Реализован UI дропдаун, который в зависимости от параметров инициализации позволяет:
- [x] выбирать только один пункт из списка;
- [x] выбирать несколько пунктов из списка (multiselect);
- [x] использовать autocomplete для фильтрации пунктов списка по набранному префиксу, с учетом неправильной раскладки
- [x] выполнять запрос на сервер для расширенного поиска в режиме реального времени;
- [x] отображать или нет аватарки пользователей в списке. 


- [x] Все параметры могут указываться независимо друг от друга.
- [x] Для запроса на сервер реализован простой API, который по подстроке возвращает необходимые данные также с учетом неправильных раскладок.
- [x] Реализация на чистом javascript, сторонние библиотеки не использованы.
- [x] Дропдаунов может быть несколько на странице.
- [x] Протестировано в IE 10-11, Edge 15-17, Firefox 45-61, Chrome 29-67, Opera s 12.16-54, Yandex 14.12, Safari 6-11.1 и современных браузерах.


# ToDo

Реализовать UI дропдаун, который в зависимости от параметров инициализации позволяет:
- выбирать только один пункт из списка;
- выбирать несколько пунктов из списка (multiselect);
- использовать autocomplete для фильтрации пунктов списка по набранному префиксу (при этом фильтрация должна учитывать все варианты неправильной раскладки, т.е. Андрей Рогозов должен подсказываться по любой из четырех подстрок "рого", "hjuj", "rogo", кщпщ"");
- выполнять запрос на сервер для расширенного поиска в режиме реального времени (например, хотим искать не только по именам пользователя, но и по короткому адресу страницы, при этом имена и фамилии есть в дропдауне на клиенте, а домен лежит только на сервере);
- отображать или нет аватарки пользователей в списке.

Все параметры могут указываться независимо друг от друга.
Для запроса на сервер необходимо реализовать простой API, который по подстроке возвращает необходимые данные также с учетом неправильных раскладок.

Требования к реализации: javascript, использование jquery не желательно, код должен быть кросс-браузерным и работать во всех современных браузерах, а также msie10+ и opera 12.16.
Нужно учесть, что таких дропдаунов может быть несколько на странице.

За основу дизайна можно взять дропдаун из окна репоста записи.

В результате — ссылка на гитхаб и развёрнутое демо со списком пользователей, в котором поиск по именам и фамилиям необходимо осуществлять на клиенте, а для поиска по домену отправлять запрос на сервер.
