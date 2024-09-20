/**
 * case1
 */
public class case1 {

    public static void main(String[] args) {
        String 
            text = "NEGIE1", 
            output = "",
            numInText = "", 
            alphaInText = "";

        for (int i = text.length()-1; i >= 0 ; i--) {
            if (!String.valueOf(text.charAt(i)).matches("-?\\d+") ) {
                if (numInText != "") {
                    output = numInText + output;
                    numInText = "";
                }
                alphaInText += text.charAt(i);
            }else {
                if (alphaInText != "") {
                    output = alphaInText + output;
                    alphaInText = "";
                }
                numInText = text.charAt(i) + numInText;
            }
        }
        if (numInText != "") output = numInText + output;
        else if (alphaInText != "") output = alphaInText + output;
        
        System.out.println(output);
    }
}