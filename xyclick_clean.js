// ==UserScript==
// @name         xyclicks
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @match        https://sts.fiatgroup.com/*
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_listValues
// @grant GM_deleteValue
// ==/UserScript==


(function() {
const c = console.log;

var snapshot = {};

$("body").append(`<script src="https://www.gstatic.com/firebasejs/4.6.0/firebase.js"></script>`);
    setTimeout(() => {
		$("body").append(`
			<script>
			// Initialize Firebase
			// TODO: Replace with your project's customized code snippet
			var config = {
			apiKey: "",
			authDomain: ".firebaseapp.com",
			databaseURL: "https://.firebaseio.com/"
			};
			firebase.initializeApp(config);
			console.log("firebase seems to have loaded.")
			</script>
		`);
        setTimeout( () => run() , 500)
    },500);
	function run () {
	inccursor(true);
	// handling clock recording
    var rec = false;
    $(window).click(function (e) {
        if (rec) {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log(e.pageX + "," + e.pageY);
			$("#inkybody").val( $("#inkybody").val() + e.pageX.toString() + "," + e.pageY + "\n");
			rec = false;
			return false;
		}

    });

	// record clicks only on ^ or , key down
    $(window).keydown( function(e) {
      if (e.which == 220 || e.which == 110) {rec = true;}
    });

	// gui
   $("body").append(`<div id="inkydiv" style="width: 200px; height:600px; position:absolute; top:0 ; left:0; border: 1px solid; background-color:red; margin:20px; padding-bottom:50px; z-index: 2000">
                            <p>Macro name:</p><textarea id="inkyname" style="width:90%"></textarea>
                             <p>Macro actions:</p><textarea id="inkybody" style="width:90%; height:300px"></textarea>
                             <button id="inkysave">Save</button><button id="inkyrun">Run</button><button id="inkyrunstep">Run Step</button><button id="inkyreset">Reset</button>
							 <div id="inkybuttongroup"></div>
                      </div>`);

	firebase.database().ref("test/").on("value", snap => {
		$("#inkybuttongroup").empty();
		snapshot = snap.val();
		console.log("snapshot:")
		console.log(snapshot)
		for(var i in snapshot) {
			if (snapshot.hasOwnProperty(i)) {
				createbutton(i)
			}
		}
		// $("#inkydiv").append(``);
	})

    $("#inkysave").click( () => {
        var inkyname = $("#inkyname").val();
        var inkybody = $("#inkybody").val();
        var elbody = {};
        elbody[inkyname] = inkybody;
		writetofirebase( inkyname , elbody);
        createbutton(inkyname);

    });

	$("#inkyrun").click( () => {
		instructions = $("#inkybody").val().split("\n");
		c("doing the first click on:" + instructions[0])
		cursor++;
		clickhere(instructions[(cursor < 1 ? 0 : cursor-1)]);
	});
	
	
	$("#inkyrunstep").click( () => {
		instructions = $("#inkybody").val().split("\n");
		inccursor().then(() => {
			getcursor().then(current => {
				c("current cursor: " +current)
				clickhere(instructions[(current -1)]);				
			})
			
		}) ;
	});
	
	$("#inkyreset").click( () => {
		inccursor(true).then(() => alert("Macro reset to step 0."))
	});

	
	// helper
	

	function getcursor () {
		return new Promise ((res,rej) => {
			firebase.database().ref("test/cursor").once("value").then(snap => {
				c("cursor value from inside getcursor:");
				var rescursor = snap.val();
				rescursor = rescursor.cursor;
				c(rescursor);
				res(parseInt(rescursor))
			})
		})
	}

	function inccursor (resetcursor) { c("calling inccursor")
		return new Promise ((resolve,reject) => {
			getcursor().then( cursor => { c("inside getcursor")
				c("cursor: " + cursor);
				var newcursorval = resetcursor ? 0 : ((parseInt(cursor) +1) || 0);
				firebase.database().ref('test/cursor').set({cursor: newcursorval}).then ( () => { c("inside final inccorsor then. before return")
					resolve() ;
				});
			})
		})
	}
	

	function writetofirebase(elhead,elbody) {
		firebase.database().ref('test/' + elhead).set(elbody).then( (err,res)  => console.log(res));
	}
    function createbutton(btnid) { 
		if (btnid == "cursor") return ;
        var btn =  '<button id="'+btnid+'">'+btnid+'</button>';
        $("#inkybuttongroup").append(btn);
		$("#"+btnid).click( e => { console.log("clicked on button. retriving snapshot.");
			var el = snapshot[btnid];
			console.log(el[btnid])
			$("#inkyname").val(btnid);
			$("#inkybody").val(el[btnid]);
		})
    }

	function clickhere(coordsstring) { 
		// var e = new jQuery.Event("click");
		// e.pageX = coordsstring.split(",")[0];
		// e.pageY = coordsstring.split(",")[1];
		c("clicking at: " + coordsstring.split(",")[0] + " + " + coordsstring.split(",")[1])
		document.elementFromPoint(parseInt(coordsstring.split(",")[0]), parseInt(coordsstring.split(",")[1])).click();
		// c("clicking on: " + coordsstring.split(",")[0] + " : " +coordsstring.split(",")[1])
		// $(window).trigger(e);
	}
	} // run
})();