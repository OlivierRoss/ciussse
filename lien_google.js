let email_regexp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
let phone_regexp = /(\+?\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/
let url_regexp = /(?:^|[^@\.\w-])([a-z0-9]+:\/\/)?(\w(?!ailto:)\w+:\w+@)?([\w.-]+\.[a-z]{2,4})(:[0-9]+)?(\/.*)?(?=$|[^@\.\w-])/i;

window.onload = async function () {
  let response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/1c2pjjmdqcpb8GeXSl_RhZ-vTVERVQcQzETUdbWOD9Ac/values/'IGNORER - Données publiques'!A:H?key=AIzaSyAl3TfynOtVS2PQRKyJPWxJShQdESCvsy4");

  if (response.ok) { // if HTTP-status is 200-299
    ajouter_donnees_DOM(await response.json());
    $("tr").click(function (event) {
      if($(window).width() <= 600) {
        event.preventDefault();
        console.log(this, event);
        $(this).modal();
      }
    });
  } else {
    alert("HTTP-Error: " + response.status);
  }
}

function ajouter_donnees_DOM (json) {
  let colonnes = json.values.slice(0, 1)[0].map((col) => { return {title: col} })//.slice(0, 5);
  let organismes = json.values.slice(1);

  let donnees = organismes.map((organisme) => {
    let obj = {};
    _.each(colonnes, (colonne, index) => {
      obj[to_id(colonne.title)] = organisme[index];
    });
    return obj;
  });

  // Regroupement des donnees
  let categories = _.groupBy(donnees, (organisme) => { return organisme.secteur_d_activit_; });

  // Passe passe pour trier
  categories = _.map(categories, (value, key) => { 
    let cat = {};
    cat[key] = value;
    return cat;
  })
  categories = _.orderBy(categories, (value) => { return Object.keys(value)[0]; }); 

  // Pour chaque section
  _.each(categories, (categorie) => {

    // Passe passe pour trier
    let key = Object.keys(categorie)[0];
    categorie = categorie[key];

    // Creer table
    let table = document.createElement("table");

    // Creer entete
    let entete = document.createElement("h3");
    entete.innerHTML = key;
    entete.onclick = afficher_categorie;

    let thead = document.createElement("thead");
    let tr = document.createElement("tr");

    _.each(colonnes, (val) => {
      // Selection des colonnes a afficher
      if(val.title.match(/secteur|adresse|courriel|téléphone/i)) return;

      let td = document.createElement("td");
      td.innerHTML = val.title;
      tr.appendChild(td);
    });
    thead.appendChild(tr);

    // Creer corps de la table
    let tbody = document.createElement("tbody");
    _.each(categorie, (organisme) => {

      // Ptit hack
      categorie = Object.values(categorie)[0];

      let tr = document.createElement("tr");

      // Première case
      let info = document.createElement("td");
      info.innerHTML = "<span>" + organisme.nom + "</span>";

      // Informations de contact
      let courriel = organisme.courriel ? organisme.courriel.match(email_regexp) : null;
      if(courriel) {
        let a = document.createElement("a");
        a.href = "mailto:" + courriel;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.innerHTML = '<img class="icone" src="courriel.png" alt="courriel"/>' + courriel;
        info.appendChild(a);
      }

      // Telephones
      if(organisme.telephone) {
        let span = document.createElement("span");
        span.innerHTML = '<img class="icone" src="tel.png" alt="telephone"/>' + tel[0];
        info.appendChild(span);
      }

      // Sites
      /*let sites = organisme.adresse ? organisme.adresse.match(url_regexp) : null;
      if (sites) {
          let a = document.createElement("a");
          a.href = sites[0];
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          if(site.match(/facebook/i)) {
            a.innerHTML = '<img class="icone" src="fb.png" alt="facebook"/>' + sites[0];
          }
          else {
            a.innerHTML = '<img class="icone" src="web.png" alt="site web"/>' + sites[0];
          }
          info.appendChild(a);
        }*/
      tr.appendChild(info);

      // Deuxieme case
      let etat = document.createElement("td");
      etat.innerHTML = organisme._tat;
      tr.appendChild(etat);

      // Troisieme case
      let reduits = document.createElement("td");
      reduits.innerHTML = organisme.services_r_duits;
      tr.appendChild(reduits);

      // Quatrieme case
      let reguliers = document.createElement("td");
      reguliers.innerHTML = organisme.services_r_guliers___mission;
      tr.appendChild(reguliers);

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    document.getElementById("section-table").appendChild(entete);
    document.getElementById("section-table").appendChild(table);
  });
}

function afficher_categorie (ev) {
  $(ev.target).next("table").toggle();
}

function search (ev) {
  let recherche = ev.target.value;
  if(recherche) {

    $("h3, table").show();
    $("tr").hide();

    let matchs = $("tbody tr").filter((index, el) => {
      return el.innerHTML.match(recherche);
    });
    $(matchs).show();

    let tables_visibles = $("table").has("tbody tr:visible");

    let tables_invisibles = $("table").filter(function () {
      return !$(this).has("tbody tr:visible").length;
    });

    $(tables_invisibles).prev("h3").hide();
  }
  else {
    $("table").hide();
    $("tr").show();
  }
}

function to_id (nom) {
  return nom.toLowerCase().replace(/[^a-z0-9]/g,'_');
}
