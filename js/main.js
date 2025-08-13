"use strict";

var isGmod = false;
var isTest = false;
var totalFiles = 50;
var totalCalled = false;
var downloadingFileCalled = false;
var percentage = 0;
var permanent = false; // ajout: évite l'erreur dans announce()

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

$(document).ready(function () {
  loadBackground();

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
