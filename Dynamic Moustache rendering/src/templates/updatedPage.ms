
<!-- -*- mode: html; -*- -->
<!DOCTYPE html>
<html>
  <head>
    <title>CS 444/544 Spreadsheet Updata</title>
    <link rel="stylesheet" href="/style.css" type="text/css"/>
  </head>
  <body>
    <h1>CS 444/544 Spreadsheet Update for {{friendlyName}}</h1>
    <p><a id="ss-act" href="/">Open other spreadsheet</a></p>
    
    <table class="ss">
      <tr>
          <th>test</th>
          <th>A</th>
          <th>B</th>
          <th>C</th>
          <th>D</th>
          <th>E</th>
          <th>F</th>
          <th>G</th>
          <th>H</th>
          <th>I</th>
          <th>J</th>
      </tr>
      {{#User}}
      <tr>
          <th>{{id}}</th>
          <td>{{a}}</td>
          <td>{{b}}</td>
          <td>{{c}}</td>
          <td>{{d}}</td>
          <td>{{e}}</td>
          <td>{{f}}</td>
          <td>{{g}}</td>
          <td>{{h}}</td>
          <td>{{i}}</td>
          <td>{{j}}</td>
      </tr>
      {{/User}}
      
    </table>
    
    <p class="error"></p>
    <form action="/ss/test" method="POST">
      <label for="ssAct">Action</label>
      <span>
	<fieldset>
          <div>
	    <input name="ssAct" type="radio" 
		   id="actClear" value="clear">
	    <label for="actClear">Clear Spreadsheet</label>
          </div>
          <div>
            <input name="ssAct" type="radio"  
		   id="actDelete" value="deleteCell">
	    <label for="act">Delete Cell</label>
          </div>
          <div>
	    <input name="ssAct" type="radio"  
		   id="actUpdate" value="updateCell">
	    <label for="actUpdate">Update Cell</label>
          </div>
        <div>
	  <input name="ssAct" type="radio" 
		 id="actCopy" value="copyCell">
	  <label for="actCopy">Copy Cell</label>
        </div>
	</fieldset>
	<br/>
	<span class="error" id="ssActError"></span>
      </span>
      <label for="cellId">Destination Cell ID</label>
      <span>
	<input name="cellId" value="" id="cellId"/>
	<br/>
	<span class="error" id="cellIdError"></span>
      </span>
      <label for="formula">Formula</label>
      <span>
	<input name="formula" value="" id="formula"/>
	<br/>
	<span class="error" id="formulaError"></span>
      </span>
      <label>&nbsp;</label>
      <input type="submit" value="Update"/>
    </form>
  </body>
</html>

