const truncate = (string) => {
    return string.slice(0, 14) + "..." + string.slice(string.length -3, string.length);
}

export default truncate;