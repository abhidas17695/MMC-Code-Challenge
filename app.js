const base_url = "http://recipepuppyproxy.herokuapp.com/api/?";
let favourites = new Map();
let searchResults = new Map();
let currentPage = 'searchPage';

function renderList(list) {
    $('#resultsdiv').html("");
    var iterator = list[Symbol.iterator]();

    let i = 0;
    for (let recipe of iterator) {
        if (i % 6 == 0) {
            let rowDiv = $('<div>');
            rowDiv.addClass('row');
            $('#resultsdiv').append(rowDiv);
        }
        let lastRow = $('#resultsdiv').children().eq($('#resultsdiv').children().length - 1);
        lastRow.append(recipe[1].renderRecipe());
        i++;
    }
}

class Recipe {
    constructor(href, ingredients, thumbnail, title, isfav) {
        this.href = href;
        this.ingredients = ingredients;
        this.thumbnail = thumbnail;
        this.title = title;
        this.isfav = isfav;
    }
    renderRecipe() {
        let recipe = this;
        let parentDiv = $('<div>').addClass('card col-md-2');
        let image = $('<img>').attr('src', this.thumbnail == "" ? 'placeholder.png':this.thumbnail).addClass('card-img-top');
        parentDiv.append(image);
        let childDiv = $('<div>').addClass('card-body');
        let header = $('<h5>').addClass('card-title').html(this.title);
        childDiv.append(header);
        let para = $('<p>').addClass('card-text').html(this.ingredients);
        childDiv.append(para);
        let buttonPara = $('<p>').addClass('card-text buttonPara text-center');
        if (this.isfav) {
            buttonPara.html($('<button>').addClass('btn btn-sm btn-danger').html('Remove from favourites').click(function (e) {
                favourites.delete(recipe.href);
                renderList(favourites);
            }));
        } else if (favourites.get(recipe.href) == undefined) {
            buttonPara.html($('<button>').addClass('btn btn-sm btn-success').html('Add to favourites').click(function (e) {
                favourites.set(recipe.href, Object.assign(new Recipe(), recipe, { isfav: true }));
                renderList(searchResults);
            }));
        }
        childDiv.append(buttonPara);
        parentDiv.append(childDiv);

        return parentDiv;
    }
}

$("#keywordSearch").on('keyup', function (e) {
    if (e.keyCode === 13) {
        currentPage = 'searchPage';
        $('#favouriteButton').removeClass('active');
        $('#searchButton').addClass('active');
        fetch(base_url + "q=" + e.target.value).then(p => {
            p.json().then(data => {
                searchResults.clear();
                data.results.map(res => {
                    searchResults.set(res.href, new Recipe(res.href, res.ingredients, res.thumbnail, res.title, false));
                });
                renderList(searchResults);
            });
        });

    }
});

$("#ingredientSearch").on('keyup', function (e) {
    if (e.keyCode === 13) {
        currentPage = 'searchPage';
        $('#favouriteButton').removeClass('active');
        $('#searchButton').addClass('active');
        let ingredients = e.target.value.split(',').map(word => word.trim());
        let stringToUse = ingredients.join(',');
        fetch(base_url + "i=" + stringToUse).then(p => {
            p.json().then(data => {
                searchResults.clear();
                data.results.map(res => {
                    searchResults.set(res.href, new Recipe(res.href, res.ingredients, res.thumbnail, res.title, false));
                });
                renderList(searchResults);
            });
        });

    }
});

$('#favouriteButton').on('click', function (e) {
    currentPage = 'favouritePage';
    $('#searchButton').removeClass('active');
    $('#favouriteButton').addClass('active');
    renderList(favourites);
});

$('#searchButton').on('click', function (e) {
    currentPage = 'searchPage';
    $('#favouriteButton').removeClass('active');
    $('#searchButton').addClass('active');
    renderList(searchResults);
});




