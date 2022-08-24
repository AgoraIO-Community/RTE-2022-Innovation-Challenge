package agora;

public class Qiu_fft {
    public static void generate(short[] data,double hz,double phase,int fs,int Num) {
        double freq;//freq还真得是double类型的
        double[] interval=new double[fs];
        interval[0]=0;
        for(int i=1;i<fs;i++)
        {
            interval[i]=interval[i-1]+(2*Math.PI)/(double)fs;
        }
        freq=hz;
        for(int i=0;i<Num;i++)
        {
            if(i<5000){
                data[i]=0;
            }
            else {
                data[i] = (short) (Math.cos(interval[i] * freq + phase) * 32767);
            }
        }
    }
    public static void generate2(short[] data,double hz,double hz2,double phase,int fs,int Num) {
        double freq;
        double[] interval=new double[fs];
        interval[0]=0;
        for(int i=1;i<fs;i++)
        {
            interval[i]=interval[i-1]+(2*Math.PI)/(double)fs;
        }
        for(int i=0;i<Num;i++)
        {
            data[i]= (short) ((short)(Math.cos(interval[i]*hz+phase)*32767*0.8)+(short)(Math.cos(interval[i]*hz2+phase)*32767*0.2));
        }
    }
    public static void generate3(short[] data,double hz,double phase,int fs,int Num,int index) {
        double freq;
        double[] interval=new double[fs];
        interval[0]=0;
        for(int i=1;i<fs;i++)
        {
            interval[i]=interval[i-1]+(2*Math.PI)/(double)fs;//妈的，结果全是一样的，得类型转换
        }
        int newIndex=index+Num;
        for(int i=index,j=0;i<newIndex;i++,j++)
        {
            data[i]=(short)(Math.cos(interval[j]*hz+phase)*32767);
        }
    }
    public static void generate4(short[] data,double[] interval,double hz,double phase,int fs,int Num,int index) {
        double freq;//freq还真得是double类型的
        int newIndex=index+Num;
        int difference=3808;
        for(int i=index,j=0;i<newIndex;i++,j++)
        {
            if(j<=difference){
                data[i]=0;
            }
            else
                data[i]=(short)(Math.cos(interval[j-difference]*hz+phase)*32767);
        }
    }
    public static class FFT {
        public static Complex[] fft(Complex[] x,int N) {
            if(N == 1 ) {
                return x;
            }
            if(N % 2 != 0) {
                return DFT.dft(x, N);
            }
            Complex[] even = new Complex[N / 2];
            for (int k = 0; k < even.length; k++) {
                even[k] = x[2 * k];
            }
            Complex[] evenValue = FFT.fft(even, even.length);
            Complex[] odd = even;
            for (int k = 0; k < odd.length; k++) {
                odd[k] = x[2 * k + 1];
            }
            Complex[] oddValue = FFT.fft(odd,odd.length);
            Complex[] result = new Complex[N];
            for (int k = 0; k < N / 2; k++) {
                double W = -2*k*Math.PI/N;
                Complex m = new Complex(Math.cos(W), Math.sin(W));
                result[k] = evenValue[k].plus(m.multiply(oddValue[k]));
                result[k + N / 2] = evenValue[k].minus(m.multiply(oddValue[k]));
            }
            return result;
        }

        public static void reverse(Complex[] A,int N) {
            int LH = N/2;
            int J = LH;
            int N1 = N-2;
            for(int I = 1;I <= N1; I++) {
                if(!(I >=J)) {
                    Complex T = A[I];
                    A[I] = A[J];
                    A[J] = T;
                }
                int K = LH;
                while(!(J < K)) {
                    J = J - K;
                    K = K/2;
                }
                J += K;

            }
        }

        public static void reverse(Complex[] A) {
            int N = A.length;
            int LH = N/2;
            int J = LH;
            int N1 = N-2;
            for(int I = 1;I <= N1; I++) {
                if(!(I >=J)) {
                    Complex T = A[I];
                    A[I] = A[J];
                    A[J] = T;
                }
                int K = LH;
                while(!(J < K)) {
                    J = J - K;
                    K = K/2;
                }
                J += K;

            }
        }
        public static Complex[] myFFT(Complex[] A,int N) {
            int M = returnM(N);
            Complex[] x = new Complex[N];
            System.arraycopy(A, 0, x, 0, N);
            reverse(x);
            for(int L = 1;L <= M;L++) {
                int B = (int)Math.pow(2, L-1);
                for(int J = 0;J <= B-1;J++) {
                    int P = (int)Math.pow(2, M-L)*J;
                    for(int k = J;k <= N-1;k += Math.pow(2, L)) {
                        double W = -2*Math.PI*P/N;
                        Complex c = x[k+B].multiply(new Complex(Math.cos(W),Math.sin(W)));
                        Complex T = x[k].plus(c);
                        x[k+B] = x[k].minus(c);
                        x[k] = T;
                    }
                }
            }
            return x;
        }

        public static void myFFT2(Complex[] A,int N,Complex[] x) {
            int M = returnM(N);
            System.arraycopy(A, 0, x, 0, N);
            reverse(x);
            for(int L = 1;L <= M;L++) {
                int B = (int)Math.pow(2, L-1);
                for(int J = 0;J <= B-1;J++) {
                    int P = (int)Math.pow(2, M-L)*J;
                    for(int k = J;k <= N-1;k += Math.pow(2, L)) {
                        double W = -2*Math.PI*P/N;
                        //W = -2*Math.PI*P/N;
                        Complex c = x[k+B].multiply(new Complex(Math.cos(W),Math.sin(W)));
                        Complex T = x[k].plus(c);
                        x[k+B] = x[k].minus(c);
                        x[k] = T;
                    }
                }
            }
        }

        public static Complex[] myFFT(Complex[] A,int offset,int N) {
            int M = returnM(N);
            Complex[] x = new Complex[N];
            System.arraycopy(A, offset, x, 0, N);
            reverse(x);
            for(int L = 1;L <= M;L++) {
                int B = (int)Math.pow(2, L-1);
                for(int J = 0;J <= B-1;J++) {
                    int P = (int)Math.pow(2, M-L)*J;
                    for(int k = J;k <= N-1;k += Math.pow(2, L)) {
                        double W = -2*Math.PI*P/N;
                        Complex c = x[k+B].multiply(new Complex(Math.cos(W),Math.sin(W)));
                        Complex T = x[k].plus(c);
                        x[k+B] = x[k].minus(c);
                        x[k] = T;
                    }
                }
            }
            return x;
        }

        public static int returnM(int N) {
            if((N&(N-1))!=0) {
                throw new RuntimeException("非2的整数幂");
            }
            int M=0;
            while((N = N / 2) != 0) {
                M++;
            }
            return M;
        }
    }

    public static class DFT {
        public static Complex[] dft(Complex[] x,int N) {

            if(N == 1 || x.length == 1) {
                return x;
            }
            Complex result[] = new Complex[N];
            for(int k = 0; k < N; k++) {
                result[k] = new Complex();
                for(int n = 0; n<N; n++) {
                    double W = -2*n*k*Math.PI/N;
                    Complex c = new Complex(Math.cos(W),Math.sin(W));
                    result[k] = result[k].plus(x[n].multiply(c));
                }
            }
            return result;
        }

    }

    public static class Complex {
        private double real;
        private double image;
        private double real2;
        private double image2;
        public Complex() {
            this(0,0);
        }


        public Complex (double real) {
            this(real,0);
        }

        public Complex(double real,double image) {
            this.real = real;
            this.image = image;
        }

        public Complex plus(Complex complex) {
            real2=complex.getReal();
            image2=complex.getImage();
            double newReal =real + real2;
            double newImage =image + image2;
            return new Complex(newReal,newImage);
        }

        public Complex minus(Complex complex) {
            real2=complex.getReal();
            image2=complex.getImage();
            double newReal =real - real2;
            double newImage =image - image2;
            return new Complex(newReal,newImage);
        }

        public Complex multiply(Complex complex) {
            real2=complex.getReal();
            image2=complex.getImage();
            double newReal = real * real2 - image * image2;
            double newImage = image * real2 + real * image2;
            return new Complex(newReal,newImage);
        }

        public Complex divide(Complex complex) {
            real2=complex.getReal();
            image2=complex.getImage();
            double sum=real2*real2 + image2*image2;
            double newReal = (real*real2 + image*image2)/sum;
            double newImage = (image*real2 - real*image2)/sum;
            return new Complex(newReal,newImage);
        }

        public double getReal() {
            return real;
        }
        public void setReal(double real) {
            this.real = real;
        }
        public double getImage() {
            return image;
        }
        public void setImage(double image) {
            this.image = image;
        }
        @Override
        public String toString() {
            return "real=" + real + ", image=" + image+", abs="+abs()+", angle="+angle();
        }
        public double abs() {
            return Math.sqrt(real*real+image*image);
        }
        public double angle() {
            return Math.atan2(image, real);
        }
    }

    public static class Util {
        public static Complex[] changeToComplex(int[] data) {
            int length = data.length;
            Complex[] res = new Complex[length];
            for (int i = 0; i < res.length; i++) {
                res[i] = new Complex(data[i]);
            }
            return res;
        }
        public static Complex[] changeToComplex(short[] data) {
            int length = data.length;
            Complex[] res = new Complex[length];
            for (int i = 0; i < res.length; i++) {
                res[i] = new Complex(data[i]);
            }
            return res;
        }
        public static void changeToComplex2(short[] data,Complex[] res) {
            int length = data.length;
            //Complex[] res = new Complex[length];
            for (int i = 0; i < res.length; i++) {
                res[i] = new Complex(data[i]);
            }
            return ;
        }
        public static void abs(Complex[] complex, double[] data) {
            for(int i=0;i<data.length;i++) {
                data[i]=complex[i].abs();
            }
        }
        public static void angle(Complex[] complex, double[] angle) {
            for(int i=0;i<angle.length;i++) {
                angle[i]=complex[i].angle();
            }
        }
        public static double[] returnToDouble(Complex[] complex) {
            double [] res = new double[complex.length];
            for (int i = 0; i < res.length; i++) {
                res[i] = complex[i].getReal();
            }
            return res;
        }
        public static double[] returnAbsData(double[] doubleDatas) {
            double[] absDatas = new double[doubleDatas.length];
            for (int i = 0; i < doubleDatas.length; i++) {
                absDatas[i] = Math.abs(doubleDatas[i]);
            }
            return absDatas;
        }

        public static double[] Integers2Doubles(int[] raw) {
            double[] res = new double[raw.length];
            for (int i = 0; i < res.length; i++) {
                res[i] = raw[i];
            }
            return res;
        }
    }
    public static void panJue(int i,int[] xuLie,int index){
        xuLie[index]=i;
    }
    public static void xuLieCode(int[] arr){

    }

}
