var weeks = 51,
  currentWeek = 0,
  log = [], // running log
  newlog = [], // log of new rats
  html = '',
  ratsPerLitter = 0,
  litterFrequency = 0,
  morbidity = 0,
  fertility = 0,
  ratZero  = new Rat(), // Our original rat
  rats     = [ratZero], // An array of all rats
  ratCount = 1,
  maxGenerations = 8;

// Bind the sliders.
// Ranges are limited partly to prevent estimates so big that will crash browser
$('#fertility').noUiSlider({
  start: 9,
  connect: "lower",
  orientation: "horizontal",
  step: 1,
  range: {
    'min': 7,
    'max': 30
  }
});
$('#ratsPerLitter').noUiSlider({
  start: 6,
  connect: "lower",
  orientation: "horizontal",
  step: 1,
  range: {
    'min': 1,
    'max': 12
  }
});
$('#litterFrequency').noUiSlider({
  start: 12,
  connect: "lower",
  orientation: "horizontal",
  step: 1,
  range: {
    'min': 8,
    'max': 15
  }
});
$('#morbidity').noUiSlider({
  start: 52,
  connect: "lower",
  orientation: "horizontal",
  step: 1,
  range: {
    'min': 10,
    'max': 52
  }
});

$('.slider').on('set', function(){
  calculateInput();
  createRats();
  writeLog();
});

$('.slider').on('slide', function(){
  $(this).prev('.range').children('.range-selected').html($(this).val().replace('.00',''))
});

calculateInput();
createRats();
writeLog();

function resetLog() {
  while (log.length > 0) {
    log.pop();
  }
  while (newlog.length > 0) {
    newlog.pop();
  }

  for (var i = 0; i < 52; i++) {
    log.push([1,0,0,0,0,0,0,0])
  };
  for (var i = 0; i < 52; i++) {
    newlog.push([0,0,0,0,0,0,0,0])
  };
}

function Rat () {
  this.birth = currentWeek;
  this.age = function() {
      return currentWeek - this.birth
    };
  this.descendents = [];
  this.generation = 0;
}

function calculateInput() {
  fertility = parseInt($('#fertility').val());
  litterFrequency = parseInt($('#litterFrequency').val());
  ratsPerLitter = parseInt($('#ratsPerLitter').val())
  morbidity = parseInt($('#morbidity').val())
}

function createRats() {
  ratCount = 1
  resetLog();
  //Reset RatZero's descendents
  while(ratZero.descendents.length > 0) {
    ratZero.descendents.pop()
  }
  $('#rats').html(' ');

  // Run through all 52 weeks. Create rats for each respective week.
  for (currentWeek = 0; currentWeek < weeks; currentWeek++) {
    checkDescendents(ratZero);
    if(havingLitter(ratZero)) {
      spawn(ratZero)
    }
    // Copy current week to the following week of the log.
    log[currentWeek + 1] = log[currentWeek].slice(0)
  };
}

function writeLog() {
  $('#total-rats').html(intcomma(ratCount));
  html = '';
  printLog(log, 'Total rats each week');
  printLog(newlog, 'New rats each week');
  $('#rats').html(html);
}

function checkDescendents(rat) {
  // Recursion! Check each child ... for children. Check those children ... for children ...
  for (var i = rat.descendents.length - 1; i >= 0; i--) {
    var r = rat.descendents[i];
    checkDescendents(r);
    // If fertile (and not dead) have babies!
    if (havingLitter(r)) {
      spawn(r);
    }
  };
}

// Create a litter of rats, all descendents of the rat passed as argument
function spawn(rat) {
  for (var i = ratsPerLitter; i > 0; i--) {
    var baby = new Rat();
    baby.birth = currentWeek;
    baby.generation = rat.generation + 1
    rat.descendents.push(baby);
    ratCount += 1;
    log[currentWeek][baby.generation] += 1;
    newlog[currentWeek][baby.generation] += 1;
  };
}

function havingLitter(rat) {
  // If fertile AND week coincides with litter frequency AND not dead yet …
  if (rat.age() >= fertility && (rat.age() - fertility) % litterFrequency ===0 && (rat.age() < morbidity)) {
    return true;
  }
  else {
    return false
  }
}

function randomIntFromInterval(min,max)
{
  return Math.floor(Math.random()*(max-min+1)+min);
}

function intcomma(n) {
    var parts=n.toString().split(".");
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
}

function printLog(log, title) {
  html += '<h2>' + title + '</h2>'
  html += '<table><tr><th>Week</th><th>Gen 0</th><th>Gen 1</th><th>Gen 2</th><th>Gen 3</th><th>Gen 4</th><th>Gen 5</th><th>Gen 6</th><th>Gen 7</th><th>Total</th></tr>'
  for (var i = 0; i < 52; i++) {
    html += '<tr><td>'
    html += i
    html += '</td>'
    for (var j = 0; j < maxGenerations; j++) {
      html += '<td>'
      html += intcomma(log[i][j])
      html += '</td>'
    };
    html += '<td>'
    var total = 0
    for (j = 0; j < maxGenerations; j++) {
      total += log[i][j]
    }
    html += intcomma(total);
    html += '</td></tr>'
  };
  html += '</table>'
  html += '<h3>JSON of data</h3>'
  html += '<textarea>' + JSON.stringify(log) + '</textarea>'
}





