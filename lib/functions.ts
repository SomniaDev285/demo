export const getAbbreviation = (name: string) => {
    const nameParts = name.trim().split(" ");
    let abbreviation = "";
  
    if (nameParts.length > 0) {
      abbreviation += nameParts[0][0];
    }
  
    if (nameParts.length > 1) {
      abbreviation += nameParts[1][0];
    }
  
    return abbreviation.toUpperCase();
  };