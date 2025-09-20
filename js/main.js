"use strict";

var isGmod = false;
var isTest = false;
var totalFiles = 50;
var totalCalled = false;
var downloadingFileCalled = false;
var percentage = 0;
var permanent = false; // ajout: évite l'erreur dans announce()
var lastTier = -1;

/**
 * Gmod Called functions
 */
function GameDetails(
  servername,
  serverurl,
  mapname,
  maxplayers,
  steamid,
  gamemode
) {
  debug("GameDetails called");
  isGmod = true;

  if (!isTest) {
    loadAll();
  }

  if (Config.title) {
    $("#title").html(Config.title);
  } else {
    $("#title").html(servername);
  }
  $("#title").fadeIn();

  if (Config.enableMap) {
    $("#mapNameValue").text(mapname);
  }

  if (Config.enableSteamID) {
    $("#steamid").html(steamid);
  }
  $("#steamid").fadeIn();

  // Ajuster taille du titre après injection
  adjustTitleSize();
}

function SetFilesTotal(total) {
  debug("SetFilesTotal called total: " + total);
  totalCalled = true;
  totalFiles = total;
}

function SetFilesNeeded(needed) {
  debug("SetFilesNeeded called needed: " + needed);
  if (totalCalled) {
    var sPercentage = 100 - Math.round((needed / totalFiles) * 100);
    percentage = sPercentage;
    setLoad(sPercentage);
  }
}

function setLoad(percentage) {
  debug(percentage + "%");
  $("#progress-bar")
    .css("width", percentage + "%")
    .attr("aria-valuenow", percentage);
  $("#progress-text").text(Math.round(percentage) + "%");
  updateProgressEffects(percentage);
}

function updateProgressEffects(p) {
  var $bar = $("#progress-bar");
  var $wrap = $("#progress-wrapper");
  // retirer états précédents
  $bar.removeClass("pb-state-0 pb-state-25 pb-state-50 pb-state-75 pb-state-90 pb-state-98 pb-finished");
  if (p >= 100) {
    $bar.addClass("pb-finished");
    return;
  }
  if (p >= 98) { $bar.addClass("pb-state-98"); }
  else if (p >= 90) { $bar.addClass("pb-state-90"); }
  else if (p >= 75) { $bar.addClass("pb-state-75"); }
  else if (p >= 50) { $bar.addClass("pb-state-50"); }
  else if (p >= 25) { $bar.addClass("pb-state-25"); }
  else { $bar.addClass("pb-state-0"); }

  // ripple sur changements de tranche de 25%
  var tier = Math.floor(p / 25);
  if (tier !== lastTier) {
    lastTier = tier;
    $wrap.addClass("ripple");
    setTimeout(function(){ $wrap.removeClass("ripple"); }, 1800);
  }
}

var fileCount = 0;
function DownloadingFile(filename) {
  filename = filename.replace("'", "").replace("?", "");
  debug("DownloadingFile called '" + filename + "'");
  downloadingFileCalled = true;
  $("#history").prepend(
    '<div class="history-item-modern flash">' + filename + "</div>"
  );
  $(".history-item-modern").each(function (i, el) {
    if (i > 6) {
      $(el).remove();
    }
    $(el).css("opacity", "" + 1 - i * 0.15);
  });
  setTimeout(function(){ $(".history-item-modern.flash").removeClass("flash"); }, 700);
}

var allow_increment = true;
function SetStatusChanged(status) {
  debug("SetStatusChanged called '" + status + "'");
  $("#history").prepend(
    '<div class="history-item-modern">' + status + "</div>"
  );
  $("#progress-desc").text(status); // ajout: maj du libellé sous la barre
  $(".history-item-modern").each(function (i, el) {
    if (i > 6) {
      $(el).remove();
    }
    $(el).css("opacity", "" + 1 - i * 0.15);
  });
  if (status === "Workshop Complete") {
    allow_increment = false;
    setLoad(80);
    $("#progress-wrapper").addClass("status-hot");
    setTimeout(function(){ $("#progress-wrapper").removeClass("status-hot"); }, 1600);
  } else if (status === "Client info sent!") {
    allow_increment = false;
    setLoad(95);
    $("#progress-wrapper").addClass("status-hot");
    setTimeout(function(){ $("#progress-wrapper").removeClass("status-hot"); }, 1600);
  } else if (status === "Starting Lua...") {
    setLoad(100);
    $("#progress-wrapper").addClass("status-hot");
  } else {
    if (allow_increment) {
      percentage = percentage + 0.1;
      setLoad(percentage);
    }
  }
}

/**
 * External Functions
 */
function loadAll() {
  $("nav").fadeIn();
  $("main").fadeIn();

  setTimeout(function () {
    debug("Checking if first time loading.. " + downloadingFileCalled);
    if (downloadingFileCalled) {
      announce(
        "This is your first time loading please wait for the files to download",
        true
      );
    }
  }, 10000);
}
function loadBackground() {
  if (Config.backgroundImage) {
    $(".background").css(
      "background-image",
      'url("images/' + Config.backgroundImage + '")'
    );
  }
}
function announce(message, ispermanent) {
  if (Config.enableAnnouncements && !permanent) {
    $("#announcement").hide();
    $("#announcement").html(message);
    $("#announcement").fadeIn();
  }
  if (ispermanent) {
    permanent = true;
  }
}
function debug(message) {
  if (Config.enableDebug) {
    console.log(message);
    $("#debug").prepend(message + "<br>");
  }
}

// Réduit la taille du titre si trop large pour l'écran/viewport
function adjustTitleSize() {
  var $title = $("#title");
  if (!$title.length) return;
  var maxWidth = Math.min($(window).width() - 64, 1150); // marge latérale
  var iteration = 0;
  while ($title.outerWidth() > maxWidth && iteration < 10) {
    var current = parseFloat($title.css("font-size"));
    if (current <= 18) break; // limite basse sécurité
    $title.css("font-size", (current * 0.92) + "px");
    iteration++;
  }
  // recalc largeur barre si fonction dispo
  if (typeof syncProgressWidth === 'function') {
    syncProgressWidth();
  }
}

$(document).ready(function () {
  loadBackground();

  // Ajuste la largeur de la progress bar sur celle du titre (après rendu / font load)
  function syncProgressWidth() {
    var $title = $("#title");
    var $wrapper = $("#progress-wrapper");
    if ($title.length && $wrapper.length) {
      // marge interne + sécurité
      var target = $title.outerWidth() + 40; // 20px padding de chaque côté
      // limite max pour éviter débordement sur petits écrans
      var max = Math.min(target, $(window).width() - 48);
      $wrapper.css("width", max + "px");
    }
  }
  setTimeout(syncProgressWidth, 150); // après première paint
  $(window).on("resize", syncProgressWidth);
  $(window).on("resize", adjustTitleSize);
  setTimeout(adjustTitleSize, 120);

  if (
    Config.announceMessages &&
    Config.enableAnnouncements &&
    Config.announcementLength
  ) {
    if (Config.announceMessages.length > 0) {
      var i = 0;
      setInterval(function () {
        announce(Config.announceMessages[i]);
        i++;
        if (i > Config.announceMessages.length - 1) {
          i = 0;
        }
      }, Config.announcementLength);
    }
  }

  setTimeout(function () {
    if (!isGmod) {
      debug("No Garry's mod testing..");
      isTest = true;
      loadAll();

      GameDetails(
        "Servername",
        "Serverurl",
        "Mapname",
        "Maxplayers",
        "SteamID",
        "Gamemode"
      );

      var totalTestFiles = 100;
      SetFilesTotal(totalTestFiles);

      var needed = totalTestFiles;
      setInterval(function () {
        if (needed > 0) {
          needed = needed - 1;
          SetFilesNeeded(needed);
          DownloadingFile("Filename " + needed);
        }
      }, 500);

      SetStatusChanged("Testing..");
    }
  }, 1000);
});
