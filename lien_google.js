let email_regexp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
let phone_regexp = /(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/
let url_regexp = /(?:^|[^@\.\w-])([a-z0-9]+:\/\/)?(\w(?!ailto:)\w+:\w+@)?([\w.-]+\.[a-z]{2,4})(:[0-9]+)?(\/.*)?(?=$|[^@\.\w-])/i;

window.onload = async function () {
  let response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/1inmEtfz_sZeA1bI6n2y581WnwOm44B-KTAxhacw2vJY/values/'IGNORER - Données publiques'!A:H?key=AIzaSyAl3TfynOtVS2PQRKyJPWxJShQdESCvsy4");

  if (response.ok) { // if HTTP-status is 200-299
    ajouter_donnees_DOM(await response.json());
  } else {
    alert("HTTP-Error: " + response.status);
  }
}

function ajouter_donnees_DOM (json) {
  let colonnes = json.values.slice(0, 1)[0].map((col) => { return {title: col} }).slice(0, 5);
  let organismes = json.values.slice(1);
  console.log(colonnes);

  // Ajustement des types de donnees
  _.each(organismes, (organisme) => {
    while(organisme.length < colonnes.length) {
      organisme.push("");
    }
  });

  // Regroupement des donnees
  let categories = _.groupBy(organismes, (organisme) => { return organisme[0]; });

  // Pour chaque section
  _.each(categories, (categorie, key) => {

    // Creer table
    let table = document.createElement("table");
    //table.id = 'table' + key;

    // Creer entete
    let entete = document.createElement("h3");
    entete.innerHTML = key;

    let thead = document.createElement("thead");
    let tr = document.createElement("tr");

    _.each(colonnes, (val) => {
      let td = document.createElement("td");
      td.innerHTML = val.title;
      tr.appendChild(td);
    });
    thead.appendChild(tr);

    // Creer corps de la table
    let tbody = document.createElement("tbody");
    _.each(categorie, (organisme) => {
      let tr = document.createElement("tr");
      _.each(organisme, (val) => {

        let courriel, site, tel, fb;
        
        // Courriels
        if(courriel = val.match(email_regexp)) {
          let a = document.createElement("a");
          a.href = "mailto:" + courriel;
          a.innerHTML = '<img class="icone" src="courriel.png" alt="courriel"/>';
          tr.childNodes[1].appendChild(a);
        }
        // Telephones
        else if (tel = val.match(phone_regexp)) {
          let a = document.createElement("a");
          a.href = "tel:" + tel;
          a.innerHTML = '<img class="icone" src="tel.png" alt="telephone"/>';
          tr.childNodes[1].appendChild(a);
        }
        // Sites
        else if (site = val.match(url_regexp)) {
          let a = document.createElement("a");
          a.href = site;
          if(val.match(/facebook/i)) {
            a.innerHTML = '<img class="icone" src="fb.png" alt="facebook"/>';
          }
          else {
            a.innerHTML = '<img class="icone" src="web.png" alt="site web"/>';
          }
          tr.childNodes[1].appendChild(a);
        }
        // Contenu
        else {
          let td = document.createElement("td");
          td.innerHTML = val;
          tr.appendChild(td);
        }
      });
      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    document.getElementById("section-table").appendChild(entete);
    document.getElementById("section-table").appendChild(table);
  });
}
