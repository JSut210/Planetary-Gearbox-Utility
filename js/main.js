$("#addstage").on("click", function(event) {
  console.log('Adding Stage');

  var col = $("#mainstage").clone(false);

  // Add remove button to secondary stages
  col.find(".stage-body").prepend("<button type='button' class='close close-stage' aria-label='Close'><span aria-hidden='true'>&times;</span></button>");

  // Reset inputs
  col.find("input").val("");
  col.find("select").val("Manual");

  $("#mainrow").append(col);
});

function addAlert(parent, message) {
  $('.alert').alert('close');

  var alert = "<div class='alert alert-danger alert-dismissible show' role='alert'>";
  alert += message;
  alert += "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>";
  alert += "<span aria-hidden='true'>&times;</span>";
  alert += "</button></div>";

  parent.prepend(alert);
}

function updateProperties(container) {
  var unknown = 0;
  var index = "0";

  container.find(".btn-source").each(function() {
    if ($(this).text() == "Calculated") {
      index = $(this).attr("index");
    }
  });

  var s = parseInt(container.find(".input-teeth-sun").val());
  var p = parseInt(container.find(".input-teeth-planet").val());
  var r = parseInt(container.find(".input-teeth-ring").val());

  switch (index) {
    case "0":
      if (isNaN(r) || isNaN(p)) {
        addAlert(container, "Invalid input");
        return;
      }

      unknown = r - 2 * p;
      break;
    case "1":
      if (isNaN(r) || isNaN(s)) {
        addAlert(container, "Invalid input");
        return;
      }

      unknown = (r - s) / 2;
      break;
    case "2":
      if (isNaN(s) || isNaN(p)) {
        addAlert(container, "Invalid input");
        return;
      }

      unknown = s + 2 * p;
      break;
  }

    console.log(unknown);

  if (!Number.isInteger(unknown) || unknown < 1) {
    addAlert(container, "Invalid input - impossible tooth count");
    return;
  }

  container.find(".btn-source").each(function() {
    if ($(this).attr("index") == index) {
      $(this).closest(".form-row").find(".input-teeth").val(unknown);
    }
  });

  $('.alert').alert('close');

  //drawStage(container.closest(".stage-body"));
}

$(document).on("click", ".close-stage", function() {
  console.log("Removing Stage");

  $(this).closest(".col-stage").remove();
});

$(document).on("click", ".dropdown-item", function() {
  var sourceName = $(this).text();

  var row = $(this).closest(".form-row");
  var card = $(this).closest(".card");

  if (sourceName == "Calculated") {
    // Search for other calculated fields and set to manual
    card.find(".btn-source").each(function() {
      var source = $(this).text();

      if (source == "Calculated") {
        $(this).closest(".form-row").find(".btn-source").text("Manual");
        $(this).closest(".form-row").find(".input-teeth").prop("disabled", false);
      }
    });

    // Disable input field within this row
    row.find(".input-teeth").prop("disabled", true);
  } else {
    row.find(".input-teeth").prop("disabled", false);
  }

  row.find(".btn-source").text(sourceName);

  updateProperties(card);
});
