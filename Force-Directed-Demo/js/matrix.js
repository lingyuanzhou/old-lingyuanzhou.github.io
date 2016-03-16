/*------------Matrix-------------*/
var Matrix = function(row, column) {
	this.matrix = [];
	this.level;
	this.row;
	this.column;
}

Matrix.prototype.zeros = function(row, column) {
	this.row = row;
	this.column = column;

	for(var i=0; i<row; i++) {
		this.matrix[i] = {};
		for(var j=0; j<column; j++) {
			this.matrix[i][j] = 0;
		}
	}
}

Matrix.prototype.ones = function(row, column) {
	this.row = row;
	this.column = column;
	
	for(var i=0; i<row; i++) {
		this.matrix[i] = {};
		for(var j=0; j<column; j++) {
			this.matrix[i][j] = 1;
		}
	}
}

Matrix.prototype.randoms = function(row, column) {
	this.row = row;
	this.column = column;
	var rnd = new Srand(10);
	
	for(var i=0; i<row; i++) {
		this.matrix[i] = {};
		for(var j=0; j<column; j++) {
			this.matrix[i][j] = rnd.randomIn(0, 100);
		}
	}
}

Matrix.prototype.transpose = function() {
	var row = this.row;
	var column = this.column;
	var matrixT = [];

	for(var i=0; i<column; i++) {
		matrixT[i] = {};
		for(var j=0; j<row; j++) {
			matrixT[i][j] = this.matrix[j][i];
		}
	}

	this.matrix = matrixT;
	this.row = column;
	this.column = row;
}

Matrix.prototype.multiply = function(input) {
	var type = typeof input;
	var result = [];

	if(type == "number") {
		var row = this.row;
		var column = this.column;

		for(var i=0; i<row; i++) {
			result[i] = {};
			for(var j=0; j<column; j++) {
				result[i][j] = this.matrix[i][j] * input;
			}
		}
	}else {
		var matrix1 = this.matrix;
		var column1 = this.column;
		input.transpose();
		var matrix2 = input.matrix;
		var column2 = input.column;

		if(column1 != column2) {
			return;
		}

		var row = this.row;
		var column = input.row;
		var count = column1;

		for(var i=0; i<row; i++) {
			result[i] = {};
			for(var j=0; j<column; j++) {
				var element = 0;
				for(var k=0; k<count; k++) {
					element = element + matrix1[i][k] * matrix2[j][k];
				}
				result[i][j] = element;
			}
		}
		input.transpose();
	}
	var newMatrix = new Matrix();
	newMatrix.matrix = result;
	newMatrix.row = row;
	newMatrix.column = column;
	return newMatrix;
}

Matrix.prototype.multiplyXV = function(XVectors) {
	var result = [];
	var row = this.row;
	var column = this.column;

	for(var i=0; i<row; i++) {
		result[i] = {};
		result[i].pos = {};
		result[i].disp = {x: 0, y: 0};
		var x = 0;
		for(var k=0; k<column; k++) {
			x = x + this.matrix[i][k]*XVectors[k].pos.x;
		}
		var y = 0;
		for(var k=0; k<column; k++) {
			y = y + this.matrix[i][k]*XVectors[k].pos.y;
		}
		result[i].pos.x = x;
		result[i].pos.y = y;
	}
	return result;
}

Matrix.prototype.subset = function(index) {
	var length = this.matrix[0].length;
	var subset = [];
	for(var i=0; i<length; i++) {
		subset[i] = this.matrix[index][i];
	}
	return subset;
}

Matrix.prototype.subtract = function(matrixInput) {
	var matrix1 = this.matrix;
	var matrix2 = matrixInput.matrix;
	if(matrix1.length != matrix2.length || matrix1[0].length != matrix2[0].length) {
		return;
	}

	var row = this.matrix.length;
	var column = this.matrix[0].length;
	var matrix1 = this.matrix;
	var matrix2 = matrixInput.matrix;
	var result = [];

	for(var i=0; i<row; i++) {
		result[i] = [];
		for(var j=0; j<column; j++) {
			result[i][j] = matrix1[i][j] - matrix2[i][j];
		}
	}
	var newMatrix = new Matrix();
	newMatrix.matrix = result;
	return newMatrix;
}

/*Matrix.prototype.add = function(matrixInput) {
	if(matrix1.length != matrix2.length || matrix1[0].length != matrix2[0].length) {
		return;
	}

	var row = this.matrix.length;
	var column = this.matrix[0].length;
	var matrix1 = this.matrix;
	var matrix2 = matrixInput.matrix;
	var result = [];

	for(var i=0; i<row; i++) {
		result[i] = [];
		for(var j=0; j<column; j++) {
			result[i][j] = matrix1[i][j] + matrix2[i][j];
		}
	}
	var newMatrix = new Matrix();
	newMatrix.matrix = result;
	return newMatrix;
}

Matrix.prototype.vectorMagnitude = function() {
	var row = this.matrix.length;
	var column = this.matrix[0].length;

	if(row == 1 && column == 2) {
		var x = this.matrix[0][0];
		var y = this.matrix[0][1];

		var magnitude = Math.sqrt(x*x + y*y);

		return magnitude;
	}
}

Matrix.prototype.vectorDirection = function() {
	var row = this.matrix.length;
	var column = this.matrix[0].length;

	if(row == 1 && column == 2) {
		var x = this.matrix[0][0];
		var y = this.matrix[0][1];

		var magnitude = Math.sqrt(x*x + y*y);
		var direction = [];
		direction[0] = x / magnitude;
		direction[1] = y / magnitude;

		var newMatrix = new Matrix();
		newMatrix.matrix = direction;

		return newMatrix;
	}
}*/