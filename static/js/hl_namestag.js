getJsonArray();

function getJsonArray(){
  $.ajax({
      url: '/index.json',
      type: 'GET',
      success: persontags
  })
}

function clean(array) {
  for (var key in array) {
    if (array[key] === null || array[key] === undefined) {
      delete array[key];
    }
  }
  return array
}

var allNames = [];
var allLinks= [];
var allTitles= [];
var allSubjects = [];
var allLinks_subject= [];
var allTitles_subject= [];

function persontags(data){
  json = data; //fetch my json
  for (var key in json) { //for each key in the json…
    if (json.hasOwnProperty(key)) { //unless that key is not used…
      var dirtyArray = json[key]; //create an array of those results…
      var result = clean(dirtyArray); //and clean it.

      //for the persons
      if (result.hasOwnProperty("persontags")) { //and if the key "personags" exists…
        for (let i = 0; i < result.persontags.length; i++) { //for each result in "persontags"…

          if (result.persontags[i].includes(" ")){

            var data = result.persontags[i]; //split it and change name with surname…
            data = data.split(' ');

            for (var j = 0; j < data.length; j++) { //capitalize first letter
              data[j] = data[j].charAt(0).toUpperCase() + data[j].slice(1);
            }

            if (data.length == 4) { //rearrange
              var surnameName = data[3] + ' ' + data[0] + ' ' + data[1] + ' ' + data[2];
            } if (data.length == 3) {
              var surnameName = data[2] + ' ' + data[0] + ' ' + data[1];
            } if (data.length == 2) {
              var surnameName = data[1] + ' ' + data[0];
            }

          } else {
            var surnameName = result.persontags[i];
          }
          //exceptions in the name (unusable characters)
          surnameName = surnameName.replaceAll("-", " ");

          if (surnameName.includes('ç')){
            surnameName = surnameName.replace('ç', 'c');
          }
          if (surnameName.includes("'")){
            surnameName = surnameName.replace("'", '’');
          }

          allNames.push(surnameName);
          allLinks.push(result.permalink);
          allTitles.push(result.title);
        }
      }

      //now for the subjects
      if (result.hasOwnProperty("subjectstags")) { //and if the key "personags" exists…
        for (let i = 0; i < result.subjectstags.length; i++) { //for each result in "persontags"…

          var subjectName = result.subjectstags[i];
          
          //exceptions in the name (unusable characters)
          if (subjectName.includes('ç')){
            subjectName = subjectName.replace('ç', 'c');
          }
          if (surnameName.includes("'")){
            surnameName = surnameName.replace("'", '’');
          }

          allSubjects.push(subjectName);
          allLinks_subject.push(result.permalink);
          allTitles_subject.push(result.title);
        }
      }
    }
  }

  const sortedNames = allNames.map((key, ind) => ({ 'name': key, 'link': [allLinks[ind]], 'title': [allTitles[ind]]}));
  sortedNames.sort((a, b) => (a.name > b.name) ? 1 : -1);

  const sortedSubjects = allSubjects.map((key, ind) => ({ 'subject': key, 'link_subject': [allLinks_subject[ind]], 'title_subject': [allTitles_subject[ind]]}));
  //sortedSubjects.sort((a, b) => (a.subject > b.subject) ? 1 : -1);

  sortedSubjects.sort(function(a, b) {
    var subjectA = a.subject.toUpperCase(); // ignore upper and lowercase
    var subjectB = b.subject.toUpperCase(); // ignore upper and lowercase
    if (subjectA < subjectB) {
      return -1;
    }
    if (subjectA > subjectB) {
      return 1;
    }

    // names must be equal
    return 0;

    //return /[A-Za-z]/.test(a.subject) - /[A-Za-z]/.test(b.subject) || (a.subject.toUpperCase() < b.subject.toUpperCase() ? -1 : a.subject.toUpperCase() > b.subject.toUpperCase() ? 1 : 0)

  });

  //adjust, remove duplicates
  for (var i = 0; i < sortedNames.length; i++) {

    //push the first letter to the list
    if ((i == 0)||(sortedNames[i-1].name.charAt(0) != sortedNames[i].name.charAt(0))) {
      sortedNames.splice(i, 0, { 'name': sortedNames[i].name.charAt(0), 'link': ' ', 'title': sortedNames[i].name.charAt(0)});
    }

    //adjust, remove duplicates
    if ((i != 0)&&(sortedNames[i].name == sortedNames[i-1].name)){
      sortedNames[i-1].link.push(sortedNames[i].link[0]);
      sortedNames[i-1].title.push(sortedNames[i].title[0]);
      sortedNames.splice(i, 1);
      i = i-1;
    }
  }

  for (var i = 0; i < sortedSubjects.length; i++) {

    //push the first letter to the list
    if ((i == 0)||(sortedSubjects[i-1].subject.charAt(0).toUpperCase() != sortedSubjects[i].subject.charAt(0).toUpperCase())) {
      sortedSubjects.splice(i, 0, { 'subject': sortedSubjects[i].subject.charAt(0).toUpperCase(), 'link_subject': ' ', 'title_subject': sortedSubjects[i].subject.charAt(0).toUpperCase()});
    }
    /*if (i > 0) {
      console.log(sortedSubjects[i-1].subject);
      console.log(sortedSubjects[i-1].subject.charAt(0));
      //console.log(sortedSubjects[i].subject.charAt(0));
    }*/



    if ((i != 0)&&(sortedSubjects[i].subject == sortedSubjects[i-1].subject)){
      sortedSubjects[i-1].link_subject.push(sortedSubjects[i].link_subject[0]);
      sortedSubjects[i-1].title_subject.push(sortedSubjects[i].title_subject[0]);
      sortedSubjects.splice(i, 1);
      i = i-1;
    }
  }

  populateWithResults(sortedNames);
  populateWithResults(sortedSubjects);
  makeItInteractive();
  return false;
}



function populateWithResults(myResults){
  var templateDefinition = $('#persontags-result').html();

  for (var i = 0; i < myResults.length; i++) {

    //const persona = document.createElement("div"); /*was span*/
    const quinome = document.createElement("span");

    if (myResults[0].hasOwnProperty("name")) {
      if (myResults[i].name.includes(" ")){
        var nameForID = myResults[i].name.replaceAll(" ", "%20");
        quinome.id = nameForID; /*was persona.id*/
      } else {
        quinome.id = myResults[i].name; /*was persona.id*/
      }
    }

    if (myResults[0].hasOwnProperty("subject")) {
      if (myResults[i].subject.includes(" ")){
        var nameForID = myResults[i].subject.replaceAll(" ", "%20");
        quinome.id = nameForID; /*was persona.id*/
      } else {
        quinome.id = myResults[i].subject; /*was persona.id*/
      }
    }


    //quinome.setAttribute("style", "margin-top: 0px; line-height: 1.2em; cursor: pointer;");
    quinome.classList.add('quinome');

    if (myResults[0].hasOwnProperty("name")) {
      quinome.innerHTML = myResults[i].name+" ";
    }
    if (myResults[0].hasOwnProperty("subject")) {
      quinome.innerHTML = myResults[i].subject+" ";
    }

    if (myResults[0].hasOwnProperty("name")) {
      $('#persontags-search-results').append(quinome);
    }
    if (myResults[0].hasOwnProperty("subject")) {
      $('#subjecttags-search-results').append(quinome);
    }
    
    //make a box for each result
    const indexBox = document.createElement("div");

    if (myResults[0].hasOwnProperty("name")) {
      if (myResults[i].name.includes(" ")){
        var nameForID = myResults[i].name.replaceAll(" ", "-");
        indexBox.id = nameForID;
      } else {
        indexBox.id = myResults[i].name;
      }
    }
    if (myResults[0].hasOwnProperty("subject")) {
      if (myResults[i].subject.includes(" ")){
        var nameForID = myResults[i].subject.replaceAll(" ", "-");
        indexBox.id = nameForID;
      } else {
        indexBox.id = myResults[i].subject;
      }
    }

    indexBox.setAttribute('class', 'index_box');
    const indexBoxInside = document.createElement("div");
    indexBoxInside.setAttribute('class', 'index_box_inside');
    indexBoxInside.style.width = "100%";
    const indexBoxName = document.createElement("p");
    indexBoxName.setAttribute('class', 'index_box_name');
    const indexBoxText = document.createElement("p");
    indexBoxText.setAttribute('class', 'index_box_text');
    const closeIndexBox = document.createElement("div");
    closeIndexBox.setAttribute('class', 'close_index_box');

    if (myResults[0].hasOwnProperty("name")) {
      indexBoxName.innerHTML = myResults[i].name;
    }
    if (myResults[0].hasOwnProperty("subject")) {
      indexBoxName.innerHTML = myResults[i].subject;
    }
    closeIndexBox.innerHTML = "+";

    if (myResults[0].hasOwnProperty("name")) {
      for (var j = 0; j < myResults[i].link.length; j++) {
        const quilink = document.createElement("a");
        quilink.id = "quilink";
        quilink.setAttribute("href", myResults[i].link[j]);
        /*if (myResults[i].title[j].includes('&amp;&amp;')){
          console.log("ciao");
          var correctTitle = 
        } else {
          var correctTitle = myResults[i].title[j];
        }*/
        quilink.innerHTML = "• "+myResults[i].title[j].replaceAll("&&", " / ")+"<br>";
        indexBoxText.append(quilink);
      }
    }
    if (myResults[0].hasOwnProperty("subject")) {
      for (var j = 0; j < myResults[i].link_subject.length; j++) {
        const quilink = document.createElement("a");
        quilink.id = "quilink";
        quilink.setAttribute("href", myResults[i].link_subject[j]);
        quilink.innerHTML = "• "+myResults[i].title_subject[j].replaceAll("&&", " / ")+"<br>";
        indexBoxText.append(quilink);
      }
    }

    indexBoxInside.append(indexBoxName);
    indexBoxInside.append(indexBoxText);
    indexBox.append(indexBoxInside);
    indexBox.append(closeIndexBox);
    $('#indexboxspace').append(indexBox);
  }

  //Delay and scroll down to selected ID
  var url = window.location.href;
  if(url.includes('#')) {
    var url = url.split('#');
    if (document.getElementById(url[1])){
      if (document.getElementById(url[1]).parentElement.id == "subjecttags-search-results"){
        document.getElementsByClassName('personsButton')[0].classList.remove('index_sel_box_active');
        document.getElementsByClassName('subjectButton')[0].classList.add('index_sel_box_active');
        document.getElementById("persontags-search-results").classList.remove('index_sel_active');
        document.getElementById("persontags-search-results").classList.add('index_sel_inactive');
        document.getElementById("subjecttags-search-results").classList.remove('index_sel_inactive');
        document.getElementById("subjecttags-search-results").classList.add('index_sel_active');
        console.log("is a subject");
      }
      document.getElementById(url[1]).scrollIntoView({ behavior: 'smooth'});
      document.getElementById(url[1]).style.color = 'var(--purpleColor)';
      //document.getElementById(url[1]).children[0].style.color = 'var(--purpleColor)' /*#B44BEB*/
    }
  }
};

function makeItInteractive(){
  $('span.quinome').each(
    function() {
      if (this.textContent.length <= 2) {
        $(this).css('color', 'var(--purpleColor)');
      }

      $(this).on("mouseover", function(e) {
        $('span').each(

          function() {
            if (this.textContent.length > 2) {
              $(this).css('color', 'black');
              $(this).css('cursor', 'pointer');
            }
          }
        );
        $(this).css('color', 'var(--purpleColor)');
      });

      $(this).on("mouseout", function(e) {
        if (this.textContent.length > 2) {
          $(this).css('color', 'black');
        }
      });

      $(this).on("click", function(e) {
        if (this.textContent.length > 2) {
          indexBackground.style.display = "block";
          var thisIndexBox = this.textContent.substring(0, this.textContent.length - 1).replaceAll(" ", "-");
          $("#"+thisIndexBox+".index_box").css('display', 'flex');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  );

  $(".close_index_box").on("click", function(e) {
    document.getElementById("indexBackground").style.display="none";
    $('.index_box').each(
      function() {
        $(this).css('display', 'none');
      }
    );
  });
}
