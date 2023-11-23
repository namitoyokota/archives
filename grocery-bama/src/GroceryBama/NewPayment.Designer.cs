namespace GroceryBama
{
    partial class NewPayment
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
            this.button_back = new System.Windows.Forms.Button();
            this.button_add = new System.Windows.Forms.Button();
            this.label1 = new System.Windows.Forms.Label();
            this.textRoutingNumber = new System.Windows.Forms.TextBox();
            this.textAccountNumber = new System.Windows.Forms.TextBox();
            this.textPaymentName = new System.Windows.Forms.TextBox();
            this.label5 = new System.Windows.Forms.Label();
            this.label4 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.comboIsDefault = new System.Windows.Forms.ComboBox();
            this.SuspendLayout();
            // 
            // button_back
            // 
            this.button_back.Location = new System.Drawing.Point(12, 391);
            this.button_back.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_back.Name = "button_back";
            this.button_back.Size = new System.Drawing.Size(107, 49);
            this.button_back.TabIndex = 68;
            this.button_back.Text = "Back";
            this.button_back.UseVisualStyleBackColor = true;
            this.button_back.Click += new System.EventHandler(this.button_back_Click);
            // 
            // button_add
            // 
            this.button_add.Location = new System.Drawing.Point(681, 391);
            this.button_add.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_add.Name = "button_add";
            this.button_add.Size = new System.Drawing.Size(107, 49);
            this.button_add.TabIndex = 67;
            this.button_add.Text = "Add Payment";
            this.button_add.UseVisualStyleBackColor = true;
            this.button_add.Click += new System.EventHandler(this.button_add_Click);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Font = new System.Drawing.Font("Microsoft Sans Serif", 16.2F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label1.Location = new System.Drawing.Point(300, 10);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(201, 32);
            this.label1.TabIndex = 64;
            this.label1.Text = "New Payment";
            // 
            // textRoutingNumber
            // 
            this.textRoutingNumber.Location = new System.Drawing.Point(306, 169);
            this.textRoutingNumber.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.textRoutingNumber.Name = "textRoutingNumber";
            this.textRoutingNumber.Size = new System.Drawing.Size(209, 22);
            this.textRoutingNumber.TabIndex = 75;
            // 
            // textAccountNumber
            // 
            this.textAccountNumber.Location = new System.Drawing.Point(306, 141);
            this.textAccountNumber.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.textAccountNumber.Name = "textAccountNumber";
            this.textAccountNumber.Size = new System.Drawing.Size(209, 22);
            this.textAccountNumber.TabIndex = 74;
            // 
            // textPaymentName
            // 
            this.textPaymentName.Location = new System.Drawing.Point(306, 111);
            this.textPaymentName.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.textPaymentName.Name = "textPaymentName";
            this.textPaymentName.Size = new System.Drawing.Size(209, 22);
            this.textPaymentName.TabIndex = 73;
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Font = new System.Drawing.Font("Microsoft Sans Serif", 10.2F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label5.Location = new System.Drawing.Point(143, 198);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(63, 20);
            this.label5.TabIndex = 72;
            this.label5.Text = "Default";
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Font = new System.Drawing.Font("Microsoft Sans Serif", 10.2F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label4.Location = new System.Drawing.Point(143, 169);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(130, 20);
            this.label4.TabIndex = 71;
            this.label4.Text = "Routing Number";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Font = new System.Drawing.Font("Microsoft Sans Serif", 10.2F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label3.Location = new System.Drawing.Point(143, 141);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(134, 20);
            this.label3.TabIndex = 70;
            this.label3.Text = "Account Number";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Font = new System.Drawing.Font("Microsoft Sans Serif", 10.2F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label2.Location = new System.Drawing.Point(143, 113);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(123, 20);
            this.label2.TabIndex = 69;
            this.label2.Text = "Payment Name";
            // 
            // comboIsDefault
            // 
            this.comboIsDefault.FormattingEnabled = true;
            this.comboIsDefault.Items.AddRange(new object[] {
            "Yes",
            "No"});
            this.comboIsDefault.Location = new System.Drawing.Point(306, 198);
            this.comboIsDefault.Name = "comboIsDefault";
            this.comboIsDefault.Size = new System.Drawing.Size(209, 24);
            this.comboIsDefault.TabIndex = 76;
            // 
            // NewPayment
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 450);
            this.Controls.Add(this.comboIsDefault);
            this.Controls.Add(this.textRoutingNumber);
            this.Controls.Add(this.textAccountNumber);
            this.Controls.Add(this.textPaymentName);
            this.Controls.Add(this.label5);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.button_back);
            this.Controls.Add(this.button_add);
            this.Controls.Add(this.label1);
            this.Name = "NewPayment";
            this.Text = "NewPayment";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button button_back;
        private System.Windows.Forms.Button button_add;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.TextBox textRoutingNumber;
        private System.Windows.Forms.TextBox textAccountNumber;
        private System.Windows.Forms.TextBox textPaymentName;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.ComboBox comboIsDefault;
    }
}