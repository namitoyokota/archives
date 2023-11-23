namespace GroceryBama
{
    partial class Checkout
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
            this.button_finalize = new System.Windows.Forms.Button();
            this.button_back = new System.Windows.Forms.Button();
            this.label1 = new System.Windows.Forms.Label();
            this.comboPaymentType = new System.Windows.Forms.ComboBox();
            this.label2 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.comboDeliveryTime = new System.Windows.Forms.ComboBox();
            this.label4 = new System.Windows.Forms.Label();
            this.textTotalPrice = new System.Windows.Forms.TextBox();
            this.label5 = new System.Windows.Forms.Label();
            this.textDeliveryInstructions = new System.Windows.Forms.TextBox();
            this.button_new_payment = new System.Windows.Forms.Button();
            this.btn_refresh = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // button_finalize
            // 
            this.button_finalize.Location = new System.Drawing.Point(676, 391);
            this.button_finalize.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_finalize.Name = "button_finalize";
            this.button_finalize.Size = new System.Drawing.Size(107, 49);
            this.button_finalize.TabIndex = 63;
            this.button_finalize.Text = "Finalize Order";
            this.button_finalize.UseVisualStyleBackColor = true;
            this.button_finalize.Click += new System.EventHandler(this.button_finalize_Click);
            // 
            // button_back
            // 
            this.button_back.Location = new System.Drawing.Point(17, 391);
            this.button_back.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_back.Name = "button_back";
            this.button_back.Size = new System.Drawing.Size(107, 49);
            this.button_back.TabIndex = 62;
            this.button_back.Text = "Back";
            this.button_back.UseVisualStyleBackColor = true;
            this.button_back.Click += new System.EventHandler(this.button_back_Click);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Font = new System.Drawing.Font("Microsoft Sans Serif", 16.2F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label1.Location = new System.Drawing.Point(329, 10);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(143, 32);
            this.label1.TabIndex = 58;
            this.label1.Text = "Checkout";
            // 
            // comboPaymentType
            // 
            this.comboPaymentType.FormattingEnabled = true;
            this.comboPaymentType.Location = new System.Drawing.Point(117, 115);
            this.comboPaymentType.Name = "comboPaymentType";
            this.comboPaymentType.Size = new System.Drawing.Size(121, 24);
            this.comboPaymentType.TabIndex = 65;
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(43, 118);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(63, 17);
            this.label2.TabIndex = 66;
            this.label2.Text = "Payment";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(482, 117);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(94, 17);
            this.label3.TabIndex = 67;
            this.label3.Text = "Delivery Time";
            // 
            // comboDeliveryTime
            // 
            this.comboDeliveryTime.FormattingEnabled = true;
            this.comboDeliveryTime.Items.AddRange(new object[] {
            "ASAP",
            "1",
            "2",
            "3",
            "4",
            "5",
            "10",
            "12",
            "24"});
            this.comboDeliveryTime.Location = new System.Drawing.Point(582, 114);
            this.comboDeliveryTime.MaxDropDownItems = 9;
            this.comboDeliveryTime.Name = "comboDeliveryTime";
            this.comboDeliveryTime.Size = new System.Drawing.Size(121, 24);
            this.comboDeliveryTime.TabIndex = 68;
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(485, 159);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(76, 17);
            this.label4.TabIndex = 69;
            this.label4.Text = "Total Price";
            // 
            // textTotalPrice
            // 
            this.textTotalPrice.Location = new System.Drawing.Point(582, 159);
            this.textTotalPrice.Name = "textTotalPrice";
            this.textTotalPrice.ReadOnly = true;
            this.textTotalPrice.Size = new System.Drawing.Size(100, 22);
            this.textTotalPrice.TabIndex = 70;
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Location = new System.Drawing.Point(46, 267);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(135, 17);
            this.label5.TabIndex = 71;
            this.label5.Text = "Delivery Instructions";
            // 
            // textDeliveryInstructions
            // 
            this.textDeliveryInstructions.Location = new System.Drawing.Point(187, 267);
            this.textDeliveryInstructions.Multiline = true;
            this.textDeliveryInstructions.Name = "textDeliveryInstructions";
            this.textDeliveryInstructions.Size = new System.Drawing.Size(516, 78);
            this.textDeliveryInstructions.TabIndex = 72;
            // 
            // button_new_payment
            // 
            this.button_new_payment.Location = new System.Drawing.Point(187, 390);
            this.button_new_payment.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_new_payment.Name = "button_new_payment";
            this.button_new_payment.Size = new System.Drawing.Size(107, 49);
            this.button_new_payment.TabIndex = 73;
            this.button_new_payment.Text = "New Payment";
            this.button_new_payment.UseVisualStyleBackColor = true;
            this.button_new_payment.Click += new System.EventHandler(this.button_new_payment_Click);
            // 
            // btn_refresh
            // 
            this.btn_refresh.Location = new System.Drawing.Point(46, 144);
            this.btn_refresh.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.btn_refresh.Name = "btn_refresh";
            this.btn_refresh.Size = new System.Drawing.Size(192, 32);
            this.btn_refresh.TabIndex = 74;
            this.btn_refresh.Text = "Refresh Payments";
            this.btn_refresh.UseVisualStyleBackColor = true;
            this.btn_refresh.Click += new System.EventHandler(this.btn_refresh_Click);
            // 
            // Checkout
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 450);
            this.Controls.Add(this.btn_refresh);
            this.Controls.Add(this.button_new_payment);
            this.Controls.Add(this.textDeliveryInstructions);
            this.Controls.Add(this.label5);
            this.Controls.Add(this.textTotalPrice);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.comboDeliveryTime);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.comboPaymentType);
            this.Controls.Add(this.button_finalize);
            this.Controls.Add(this.button_back);
            this.Controls.Add(this.label1);
            this.Name = "Checkout";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button button_finalize;
        private System.Windows.Forms.Button button_back;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.ComboBox comboPaymentType;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.ComboBox comboDeliveryTime;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.TextBox textTotalPrice;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.TextBox textDeliveryInstructions;
        private System.Windows.Forms.Button button_new_payment;
        private System.Windows.Forms.Button btn_refresh;
    }
}