let email_regexp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
let phone_regexp = /(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/
let url_regexp = /(?:^|[^@\.\w-])([a-z0-9]+:\/\/)?(\w(?!ailto:)\w+:\w+@)?([\w.-]+\.[a-z]{2,4})(:[0-9]+)?(\/.*)?(?=$|[^@\.\w-])/i;
//let url_regexp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/

window.onload = async function () {
  let response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/1inmEtfz_sZeA1bI6n2y581WnwOm44B-KTAxhacw2vJY/values/'IGNORER - Données publiques'!A:H?key=AIzaSyAl3TfynOtVS2PQRKyJPWxJShQdESCvsy4");

  if (response.ok) { // if HTTP-status is 200-299
    ajouter_donnees_DOM(await response.json());
  } else {
    alert("HTTP-Error: " + response.status);
  }
}

function ajouter_donnees_DOM (json) {
  let organismes = json.values.slice(1);
  let colonnes = json.values.slice(0, 1)[0].map((col) => { return {title: col} });
  let table = document.getElementById("table");

  // Ajustement des types de donnees
  _.each(organismes, (organisme) => {
    while(organisme.length < colonnes.length) {
      organisme.push("");
    }
  });

  // Creer entete
  let thead = document.createElement("thead");

  _.each(json.values.slice(0, 1), (colonne) => {
    let tr = document.createElement("tr");
    _.each(colonne, (val) => {
      let td = document.createElement("td");
      td.innerHTML = val;
      tr.appendChild(td);
    });
    thead.appendChild(tr);
  });

  // Creer corps de la table
  let tbody = document.createElement("tbody");
  _.each(organismes, (organisme) => {
    let tr = document.createElement("tr");
    _.each(organisme, (val) => {
      let td = document.createElement("td");

      // Sites
      val = val.replace(url_regexp, function (match) {
        return "<a href='" + match + "'>" + match + "</a>";
      });

      // Telephones
      val = val.replace(phone_regexp, function (match) {
        return "<a href='tel:" + match + "'>" + match + "</a>";
      });

      // Courriels
      val = val.replace(email_regexp, function (match) {
        return "<a href='mailto:" + match + "'>" + match + "</a>";
      });

      td.innerHTML = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  // Initialisation de Datatables
  let groupColumn = 0;

  $('#table').DataTable({
    responsive: true,
    //data: organismes,
    //columns: colonnes,
    paging: false,
    "columnDefs": [
      {
        "targets": [0],
        "visible": false,
        "searchable": false
      },
      {
        "targets": [1],
        responsivePriority: 1
      },
      {
        "targets": [2],
        responsivePriority: 2
      }
    ],
    "order": [[ groupColumn, 'asc'  ]],
    "drawCallback": function ( settings  ) {
      var api = this.api();
      var rows = api.rows( {page:'current'}  ).nodes();
      var last=null;

      api.column(groupColumn, {page:'current'} ).data().each( function ( group, i  ) {
        if ( last !== group  ) {
          $(rows).eq( i  ).before(
            '<tr class="group"><td colspan="' + (colonnes.length - 2) + '">'+group+'</td></tr>'
          );
          last = group;
        }
      });
    },
    language: donnees_fr
  });
}

///// DONNEES /////

var donnees_fr = {
  "sEmptyTable":     "Aucune donnée disponible dans le tableau",
  "sInfo":           "Affichage de l'élément _START_ à _END_ sur _TOTAL_ éléments",
  "sInfoEmpty":      "Affichage de l'élément 0 à 0 sur 0 élément",
  "sInfoFiltered":   "(filtré à partir de _MAX_ éléments au total)",
  "sInfoPostFix":    "",
  "sInfoThousands":  ",",
  "sLengthMenu":     "Afficher _MENU_ éléments",
  "sLoadingRecords": "Chargement...",
  "sProcessing":     "Traitement...",
  "sSearch":         "Rechercher :",
  "sZeroRecords":    "Aucun élément correspondant trouvé",
  "oPaginate": {
    "sFirst":    "Premier",
    "sLast":     "Dernier",
    "sNext":     "Suivant",
    "sPrevious": "Précédent"
  },
  "oAria": {
    "sSortAscending":  ": activer pour trier la colonne par ordre croissant",
    "sSortDescending": ": activer pour trier la colonne par ordre décroissant"
  },
  "select": {
    "rows": {
      "_": "%d lignes sélectionnées",
      "0": "Aucune ligne sélectionnée",
      "1": "1 ligne sélectionnée"
    }
  }
}
