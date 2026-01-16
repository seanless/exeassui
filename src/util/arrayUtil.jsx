let ArrayUtil = {
  groupBy:function(array ,id ) {
    let groups = {};
    array.forEach( function( o ) {
        let group = JSON.stringify( o[id] );
        groups[group] = groups[group] || [];
        groups[group].push( o );
    });

    return Object.values(groups);
  },
  groupByKey:function(array ,id ) {
    let groups = {};
    array.forEach( function( o ) {
        let group = JSON.stringify( o[id] );
        groups[group] = groups[group] || [];
        groups[group].push( o );
    });

    return groups;
    //return Object.values(groups);
  }
}

export default ArrayUtil