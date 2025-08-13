"use strict";

var isGmod = false;
var isTest = false;
var totalFiles = 50;
var totalCalled = false;
var downloadingFileCalled = false;
var percentage = 0;

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
    var displaySteamId = toStandardSteamIDIf64(steamid);
    $("#steamid").text(displaySteamId);
    $("#steamid").fadeIn();
  } else {
    $("#steamid").hide();
  }
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
}

var fileCount = 0;
function DownloadingFile(filename) {
  filename = filename.replace("'", "").replace("?", "");
  debug("DownloadingFile called '" + filename + "'");
  downloadingFileCalled = true;
  $("#history").prepend(
    '<div class="history-item-modern">' + filename + "</div>"
  );
  $(".history-item-modern").each(function (i, el) {
    if (i > 6) {
      $(el).remove();
    }
    $(el).css("opacity", "" + 1 - i * 0.15);
  });
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
  } else if (status === "Client info sent!") {
    allow_increment = false;
    setLoad(95);
  } else if (status === "Starting Lua...") {
    setLoad(100);
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
// Convertit un SteamID64 (7656...) en SteamID classique STEAM_0:X:Z.
// Retourne l'entrée si elle est déjà au format STEAM_X:Y:Z ou si la conversion échoue.
function toStandardSteamIDIf64(steamId) {
  if (!steamId) return "";
  // Si déjà au format STEAM_X:Y:Z, ne rien faire
  if (/^STEAM_\d+:\d+:\d+$/.test(steamId)) return steamId;
  // Si c'est un 64-bit numérique
  var cleaned = String(steamId).trim();
  // Autoriser "[U:1:Z]" (Steam3) -> convertir aussi
  var steam3Match = cleaned.match(/^\[U:(\d+):(\d+)\]$/);
  if (steam3Match) {
    var yFrom3 = Number(steam3Match[2]) % 2;
    var zFrom3 = Math.floor(Number(steam3Match[2]) / 2);
    return "STEAM_0:" + yFrom3 + ":" + zFrom3;
  }
  if (!/^\d{17}$/.test(cleaned)) return steamId;
  try {
    var big = typeof BigInt !== "undefined" ? BigInt(cleaned) : null;
    if (!big) return steamId; // pas de BigInt disponible
    var base = BigInt("76561197960265728");
    var y = big % 2n;
    var z = (big - base - y) / 2n;
    // Universe traditionnellement 0 pour Garry's Mod
    return "STEAM_0:" + y.toString() + ":" + z.toString();
  } catch (e) {
    // Fallback sans BigInt (approx) — laisser tel quel pour éviter une mauvaise valeur
    return steamId;
  }
}

function loadAll() {
  $("nav").fadeIn();
  $("main").fadeIn();
}
function loadBackground() {
  if (Config.backgroundImage) {
    $(".background").css(
      "background-image",
      'url("images/' + Config.backgroundImage + '")'
    );
  }
}
function debug(message) {
  if (Config.enableDebug) {
    console.log(message);
    $("#debug").prepend(message + "<br>");
  }
}

$(document).ready(function () {
  loadBackground();

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
