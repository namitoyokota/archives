namespace GroceryBama
{
    partial class PaymentMethods
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.label1 = new System.Windows.Forms.Label();
            this.button3 = new System.Windows.Forms.Button();
            this.button_new_payment = new System.Windows.Forms.Button();
            this.textListPayments = new System.Windows.Forms.TextBox();
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Font = new System.Drawing.Font("Microsoft Sans Serif", 16.2F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label1.Location = new System.Drawing.Point(271, 9);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(258, 32);
            this.label1.TabIndex = 59;
            this.label1.Text = "Payment Methods";
            // 
            // button3
            // 
            this.button3.Location = new System.Drawing.Point(12, 390);
            this.button3.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button3.Name = "button3";
            this.button3.Size = new System.Drawing.Size(107, 49);
            this.button3.TabIndex = 63;
            this.button3.Text = "Back";
            this.button3.UseVisualStyleBackColor = true;
            this.button3.Click += new System.EventHandler(this.button3_Click);
            // 
            // button_new_payment
            // 
            this.button_new_payment.Location = new System.Drawing.Point(681, 390);
            this.button_new_payment.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_new_payment.Name = "button_new_payment";
            this.button_new_payment.Size = new System.Drawing.Size(107, 49);
            this.button_new_payment.TabIndex = 61;
            this.button_new_payment.Text = "New Payment Method";
            this.button_new_payment.UseVisualStyleBackColor = true;
            this.button_new_payment.Click += new System.EventHandler(this.button_new_payment_Click);
            // 
            // textListPayments
            // 
            this.textListPayments.Location = new System.Drawing.Point(12, 44);
            this.textListPayments.Multiline = true;
            this.textListPayments.Name = "textListPayments";
            this.textListPayments.ReadOnly = true;
            this.textListPayments.Size = new System.Drawing.Size(776, 341);
            this.textListPayments.TabIndex = 60;
            // 
            // PaymentMethods
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 450);
            this.Controls.Add(this.button3);
            this.Controls.Add(this.button_new_payment);
            this.Controls.Add(this.textListPayments);
            this.Controls.Add(this.label1);
            this.Name = "PaymentMethods";
            this.Text = "PaymentMethods";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Button button3;
        private System.Windows.Forms.Button button_new_payment;
        private System.Windows.Forms.TextBox textListPayments;
    }
}