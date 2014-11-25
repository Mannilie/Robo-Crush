Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

Array.prototype.popObj = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            this.splice(i, 1);
        }
    }
    return false;
}
//Array.prototype.pop = function pop(obj) {
//    for (var key in obj) {
//        // Uncomment below to fix prototype problem.
//        // if (!Object.hasOwnProperty.call(obj, key)) continue;
//        var result = obj[key];
//        // If the property can't be deleted fail with an error.
//        if (!delete obj[key]) {
//            throw new Error();
//        }
//        return result;
//    }
//}