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
// Convertit un SteamID64 (7656...) en STEAM_0:X:Z sans BigInt (compat moteurs anciens)
function toStandardSteamIDIf64(steamId) {
  if (!steamId) return "";
  if (/^STEAM_\d+:\d+:\d+$/.test(steamId)) return steamId;
  var s = String(steamId).trim();
  // Steam3 -> classique
  var steam3 = s.match(/^\[U:(\d+):(\d+)\]$/);
  if (steam3) {
    var accountId3 = parseInt(steam3[2], 10);
    var y3 = accountId3 % 2;
    var z3 = (accountId3 - y3) / 2;
    return "STEAM_0:" + y3 + ":" + z3;
  }
  if (!/^\d{17}$/.test(s)) return steamId;

  // Opérations 64-bit sur chaînes: z = (steamID64 - 76561197960265728 - y) / 2
  var base = "76561197960265728";
  var y = parseInt(s.charAt(s.length - 1), 10) % 2; // parité
  var sub1 = subDecStrings(s, base);
  var sub2 = subDecStrings(sub1, String(y));
  var zStr = div2DecString(sub2);
  // enlever zéros en tête
  zStr = zStr.replace(/^0+/, "");
  if (zStr === "") zStr = "0";
  return "STEAM_0:" + y + ":" + zStr;
}

// Soustraction décimale de grandes chaînes: a - b (a>=b), retourne chaîne
function subDecStrings(a, b) {
  a = a.replace(/^0+/, "");
  b = b.replace(/^0+/, "");
  if (a === "") a = "0";
  if (b === "") b = "0";
  // Assurer a >= b, sinon retourner "0"
  if (cmpDecStrings(a, b) < 0) return "0";
  var res = [];
  var carry = 0;
  var i = a.length - 1;
  var j = b.length - 1;
  while (i >= 0 || j >= 0) {
    var da = i >= 0 ? a.charCodeAt(i) - 48 : 0;
    var db = j >= 0 ? b.charCodeAt(j) - 48 : 0;
    var d = da - db - carry;
    if (d < 0) { d += 10; carry = 1; } else { carry = 0; }
    res.push(String.fromCharCode(48 + d));
    i--; j--;
  }
  while (res.length > 1 && res[res.length - 1] === '0') res.pop();
  return res.reverse().join("");
}

// Division par 2 d'une grande chaîne décimale positive
function div2DecString(s) {
  var carry = 0;
  var out = "";
  for (var i = 0; i < s.length; i++) {
    var n = carry * 10 + (s.charCodeAt(i) - 48);
    var q = Math.floor(n / 2);
    carry = n % 2;
    out += String.fromCharCode(48 + q);
  }
  return out.replace(/^0+/, "") || "0";
}

function cmpDecStrings(a, b) {
  a = a.replace(/^0+/, "");
  b = b.replace(/^0+/, "");
  if (a.length !== b.length) return a.length > b.length ? 1 : -1;
  if (a === b) return 0;
  return a > b ? 1 : -1;
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
