let email_regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g;

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
  let table = document.getElementById("table");

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

      // TODO creer des liens cliquables
      if(val.match(email_regexp)) {
        console.log("email!");
      }
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
    //columns: json.values.slice(0, 1)[0].map((col) => { return {title: col} }),
    paging: false,
    "columnDefs": [
      {
        "targets": [0],
        "visible": false,
        "searchable": false
      },
      {
        "targets": [1],
        //"width": '25%',
        responsivePriority: 1
      },
      {
        "targets": [2],
        //"width": '65%',
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
            '<tr class="group"><td colspan="5">'+group+'</td></tr>'
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
