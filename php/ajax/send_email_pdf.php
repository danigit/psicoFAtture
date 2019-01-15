<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 05/11/18
 * Time: 23.47
 */

require_once "../mailer/PHPMailerAutoload.php";
require_once 'communication.php';
require_once 'helper.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

class send_email_pdf extends communication {
    private $pdf, $email, $decodedFile;

    protected function input_elaboration(){
        //TODO constrolare se funziona ancora con register
        $this->pdf = $this->validate_string("pdf");

        if ($this->pdf === false)
            $this->json_error("Nessun pdf ricevuto");

//        $this->email = 'simona.psi@gmail.com';
//        $this->email = 'ds.acconto@gmail.com';

        $this->email = $this->validate_string('email');
        if ($this->email === false)
            $this->json_error("Nessuna email ricevuta");


        $this->decodedFile = explode('data:application/pdf;filename=generated.pdf;base64,', $this->pdf);
        $this->decodedFile = base64_decode($this->decodedFile[1]);
    }

    protected function retrieve_data(){
        $mail = new PHPMailer;
        $mail->isSMTP();
        $mail->Host = 'tls://smtp.gmail.com';
        $mail->Port = 587; //587; // 465;
        $mail->SMTPSecure = 'tls';
        $mail->SMTPAuth = true;
        $mail->Username = "simona.bettoli@gmail.com";
//        $mail->Username = "ds.acconto@gmail.com";
        $mail->Password = "877330As!";
//        $mail->Password = "!ds.acconto!88";
        $mail->setFrom('simona.bettoli@gmail.com', 'Dott.ssa Simona Bettoli');
        $mail->addAddress($this->email);
        $mail->Subject = "Fattura";
        $mail->msgHTML("Buongiorno, <br> invio in allegato la fattura relativa all'ultimo colloquio. <br> Saluti. <br>
                                    <br>Dott.ssa Simona Bettoli<br>Psicologa<br>Via XXV Aprile 8/6<br>16123 - Genova<br>Tel. 333 873 72 31<br>
                                    <a href='https://www.psicologaatgenova.it'>Sito Web</a><br><a href='https://www.facebook.com/psicologaatgenova/'>Facebook</a>
                                    <br><br> -- <br><br> Le informazioni contenute in questo messaggio di posta elettronica sono riservate e confidenziali e ne è vietata 
                                    la diffusione in qualunque modo e sotto qualsiasi forma. Qualora Lei non fosse la persona alla quale il presente messaggio è 
                                    destinato, La invitiamo ad eliminarlo e a non utilizzare in alcun caso il suo contenuto, dandone gentilmente comunicazione al mittente.<br><br>
                                    This e-mail communication and any attachments may contain confidential and privileged information for the use of 
                                    the designated recipient above. If you are not the intended recipient, you are hereby notified that you received 
                                    this communication in error and that any review, disclosure, dissemination, distribution or copying of it or its 
                                    contents is prohibited. If you have received this communication in error, please notify me immediately by replying to 
                                    this message and deleting it from your computer. Thank you.<br><br>");
        try {
            $mail->addStringAttachment($this->decodedFile, 'Fattura.pdf');
        } catch (phpmailerException $e) {
            var_dump($e);
        }
        if(!$mail->send()) //telnet smtp.aruba.it 587
            $this->json_error("Mail non spedita per motivo sconosciuto" . $mail->ErrorInfo );
    }

    protected function return_data(){
        return array();
    }
}

$email_pdf = new send_email_pdf();
$email_pdf->execute();